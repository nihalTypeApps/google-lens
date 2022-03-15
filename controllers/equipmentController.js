const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const dbConnection = require("../utils/dbConnection");
const helper_general = require("../helpers/general");
const helper_equipment = require("../helpers/equipment");
const helper_exercise = require("../helpers/exercise");
const helper_video = require("../helpers/video");

exports.addEquipmentPage = async (req, res, next) => {
    res.render('equipment/add', {
        title: 'Welcome to Axces | Add Equipment',
        page_title:'Add Equipment'
    });
}

exports.equipmentListingPage = async (req, res, next) => {
    res.render('equipment/listing', {
        title: 'Welcome to Axces | Manage Equipment',
        page_title:'Manage Equipment'
    });
}

exports.getEquipments = async (req, res, next) => {
  let equipments = [];
  let totalFiltered = 0;
  let data = [];
  await helper_equipment.getEquipments(req).then(row=>{
    equipments = row;
  },err=>{
    res.json(err);
  });
  await helper_equipment.getEquipmentsCount(req).then(row=>{
    totalFiltered = row;
  },err=>{
    res.json(err);
  });
  if(totalFiltered > 0){
    equipments.forEach((equipment,index) =>{
      var nestedData = {};
      nestedData['sn'] = helper_general.getSerialNumber(req.body.start, index);
      nestedData['title'] = equipment.title;
      nestedData['image'] = '<img src="/uploads/equipment/thumb/'+equipment.image+'" class="img-circle" alt="">';
      //nestedData['qr_code'] = '<img src="/uploads/equipment/qr_code/'+equipment.qr_code+'" class="img-circle" alt="">';
      nestedData['options'] = '<div class="btn-group">';
      nestedData['options'] += '<button class="btn btn-secondary btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Action</span><span class="caret"></span></button>';
      nestedData['options'] += '<ul class="dropdown-menu">';
      nestedData['options'] += '<li><a onclick="editData(this)" data-id = "'+equipment.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-pencil"></i>Edit</a></li>';
      nestedData['options'] += '<li><a onclick="deleteData(this)" data-id = "'+equipment.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-trash"></i>Delete</a></li>';
      nestedData['options'] += '<li><a onclick="assignExercise(this)" data-id = "'+equipment.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-grav"></i>Assign Exercise</a></li>';
      nestedData['options'] += '<li><a onclick="uploadVideo(this)" data-id = "'+equipment.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-play"></i>Videos</a></li>';
      //nestedData['options'] += '<li><a download="'+equipment.title+'" data-id = "'+equipment.id+'" class="dropdown-item main-text" href="/uploads/equipment/qr_code/'+equipment.qr_code+'"><i class="fa fa-fw fa-qrcode"></i>Download QR</a></li>';
      nestedData['options'] += '</ul>';
      nestedData['options'] += '</div>';
      data.push(nestedData);
    });

  }
  let json_data = {
    "draw" :parseInt(req.body.draw),
    "recordsTotal" :parseInt(totalFiltered),
    "recordsFiltered" :parseInt(totalFiltered),
    "data" :data
  }
  res.json(json_data);
}

exports.deleteEquipment = async (req, res, next) => {
  var id = req.body.id;
  await helper_equipment.getEquipmentDetail(req).then(async (row)=>{
    console.log(row);
    res.render('equipment/equipment-delete', {
        equipment: row
    });
  },err=>{
    res.render('equipment/equipment-delete', {
        error: err
    });
  });
}

exports.deleteEquipmentVideo = async (req, res, next) => {
  var id = req.body.id;
  await helper_video.getVideoDetail(id).then(async (row)=>{
    res.render('equipment/video-delete', {
        video: row
    });
  },err=>{
    res.render('equipment/video-delete', {
        error: err
    });
  });
}

exports.assignExercise = async (req, res, next) => {
  var id = req.body.id;
  await helper_equipment.getEquipmentDetail(req).then(async (row)=>{
    res.render('equipment/assign-exercise', {
        equipment: row
    });
  },err=>{
    res.render('equipment/assign-exercise', {
        error: err
    });
  });
}

exports.getExercisesForAssignment = async (req, res, next) => {
  let exercises = [];
  let totalFiltered = 0;
  let data = [];
  //req.body['equipment_id']
  await helper_exercise.getExercises(req).then(row=>{
    exercises = row;
  },err=>{
    res.json(err);
  });
  await helper_exercise.getExercisesCount(req).then(row=>{
    totalFiltered = row;
  },err=>{
    res.json(err);
  });
  if(totalFiltered > 0){
    exercises.forEach((exercise,index) =>{
      var nestedData = {};
      nestedData['sn'] = helper_general.getSerialNumber(req.body.start, index);
      nestedData['title'] = exercise.title;
      nestedData['image'] = '<img src="/uploads/exercise/thumb/'+exercise.image+'" class="img-circle" alt="">';
      nestedData['options'] = '<div class="checkbox"><label>';
      var checked = (exercise.equipments_exercises_id!==null)?'checked':'';
      nestedData['options'] += '<input type="checkbox" '+checked+' name="assign" value="'+exercise.id+'" onclick="assigThisExercise(this)"> Assign';
      nestedData['options'] += '</label></div>';
      data.push(nestedData);
    });
  }
  let json_data = {
    "draw" :parseInt(req.body.draw),
    "recordsTotal" :parseInt(totalFiltered),
    "recordsFiltered" :parseInt(totalFiltered),
    "data" :data
  }
  res.json(json_data);
}

exports.processExercisesAssignment = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }

  try {
    if(error.length == 0){
      switch(req.body.action){
        case 'add':{
          var insert = {};
          insert['equipment_id'] = req.body.equipment_id;
          insert['exercise_id'] = req.body.exercise_id;
          var conditions = helper_general.buildInsertConditionsString(insert);
          var sql = "INSERT INTO `equipments_exercises`("+conditions.inserts+") VALUES("+conditions.fields+")";
          await dbConnection.execute(sql,conditions.values).then((row) => {
            response['status'] = '1';
            response['data']['message'] = "Assigned successfully.";
          }, (err) => {
            error.push(err.message);
            response['data']['error'] = error;
          });
        } break;
        case 'delete':{
          var where = {};
          where['equipment_id = ?'] = req.body.equipment_id;
          where['exercise_id = ?'] = req.body.exercise_id;
          var conditions = helper_general.buildDeleteConditionsString(where);
          var sql = "DELETE FROM `equipments_exercises` WHERE "+conditions.where;
          await dbConnection.execute(sql,conditions.values).then((row) => {
            //ResultSetHeader
            response['status'] = '1';
            response['data']['message'] = "Unassigned successfully.";
          }, (err) => {
            error.push(err.message);
            response['data']['error'] = error;
          })
        } break;
      }
    }
    else{
      response['data']['error'] = error;
    }
    res.json(response);
  }
  catch (e) {
      next(e);
  }
}

exports.equipmentUploadVideo = async (req, res, next) => {
  var id = req.body.id;
  await helper_equipment.getEquipmentDetail(req).then(async (row)=>{
    res.render('equipment/upload-video', {
        equipment: row
    });
  },err=>{
    res.render('equipment/upload-video', {
        error: err
    });
  });
}


exports.getEquipmentVideos = async (req, res, next) => {
  let videos = [];
  let totalFiltered = 0;
  let data = [];
  await helper_video.getVideos(req).then(row=>{
    videos = row;
  },err=>{
    res.json(err);
  });
  await helper_video.getVideosCount(req).then(row=>{
    totalFiltered = row;
  },err=>{
    res.json(err);
  });
  if(totalFiltered > 0){
    videos.forEach((video,index) =>{
      var nestedData = {};
      nestedData['sn'] = helper_general.getSerialNumber(req.body.start, index);
      nestedData['title'] = video.title;
      nestedData['image'] = '<img src="/uploads/video/equipment/thumbnail_image/thumb/'+video.thumb_image+'" video-url="'+video.video+'" class="img-circle" alt="">';
      nestedData['image'] += '&nbsp;<a href="#" onclick="playVideoModal(this)" video-title="'+video.title+'" video-url="'+video.video+'" poster-url="/uploads/video/equipment/thumbnail_image/thumb/'+video.thumb_image+'"><i class="fa fa-play" aria-hidden="true"></i> <em>play</em></a>';
      nestedData['options'] = '<div class="btn-group">';
      nestedData['options'] += '<button class="btn btn-secondary btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Action</span><span class="caret"></span></button>';
      nestedData['options'] += '<ul class="dropdown-menu">';
      nestedData['options'] += '<li><a onclick="editVideo(this)" data-id = "'+video.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-pencil"></i>Edit</a></li>';
      nestedData['options'] += '<li><a onclick="deleteVideo(this)" data-id = "'+video.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-trash"></i>Delete</a></li>';
      nestedData['options'] += '</ul>';
      nestedData['options'] += '</div>';
      data.push(nestedData);
    });
  }
  let json_data = {
    "draw" :parseInt(req.body.draw),
    "recordsTotal" :parseInt(totalFiltered),
    "recordsFiltered" :parseInt(totalFiltered),
    "data" :data
  }
  res.json(json_data);
}

exports.updateEquipmentVideo = async (req, res, next) => {
  var id = req.body.id;
  await helper_video.getVideoDetail(id).then(async (row)=>{
    res.render('equipment/video-edit', {
        video: row
    });
  },err=>{
    res.render('equipment/video-edit', {
        error: err
    });
  });
}
