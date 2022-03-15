const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const dbConnection = require("../utils/dbConnection");
const helper_general = require("../helpers/general");
const helper_exercise = require("../helpers/exercise");
const helper_video = require("../helpers/video");
exports.addExercisePage = async (req, res, next) => {
    res.render('exercise/add', {
        title: 'Welcome to Axces | Add Exercise',
        page_title:'Add Exercise'
    });
}

exports.exerciseListingPage = async (req, res, next) => {
    res.render('exercise/listing', {
        title: 'Welcome to Axces | Manage Exercises',
        page_title:'Manage Exercises'
    });
}

exports.getExercises = async (req, res, next) => {
  let exercises = [];
  let totalFiltered = 0;
  let data = [];
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
      nestedData['options'] = '<div class="btn-group">';
      nestedData['options'] += '<button class="btn btn-secondary btn-sm btn-primary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Action</span><span class="caret"></span></button>';
      nestedData['options'] += '<ul class="dropdown-menu">';
      nestedData['options'] += '<li><a onclick="editData(this)" data-id = "'+exercise.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-pencil"></i> Edit</a></li>';
      nestedData['options'] += '<li><a onclick="deleteData(this)" data-id = "'+exercise.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-trash"></i> Delete</a></li>';
      nestedData['options'] += '<li><a onclick="uploadVideo(this)" data-id = "'+exercise.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-play"></i>Videos</a></li>';
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

exports.deleteExercise = async (req, res, next) => {
  var id = req.body.id;
  await helper_exercise.getExerciseDetail(req).then(async (row)=>{
    res.render('exercise/exercise-delete', {
        exercise: row
    });
  },err=>{
    res.render('exercise/exercise-delete', {
        error: err
    });
  });
}

exports.deleteExerciseVideo = async (req, res, next) => {
  var id = req.body.id;
  await helper_video.getVideoDetail(id).then(async (row)=>{
    res.render('exercise/video-delete', {
        video: row
    });
  },err=>{
    res.render('exercise/video-delete', {
        error: err
    });
  });
}

exports.exerciseUploadVideo = async (req, res, next) => {
  var id = req.body.id;
  await helper_exercise.getExerciseDetail(req).then(async (row)=>{
    res.render('exercise/upload-video', {
        exercise: row
    });
  },err=>{
    res.render('exercise/upload-video', {
        error: err
    });
  });
}

exports.getExerciseVideos = async (req, res, next) => {
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
      nestedData['image'] = '<img src="/uploads/video/exercise/thumbnail_image/thumb/'+video.thumb_image+'" video-url="'+video.video+'" class="img-circle" alt="">';
      nestedData['image'] += '&nbsp;<a href="#" onclick="playVideoModal(this)" video-title="'+video.title+'" video-url="'+video.video+'" poster-url="/uploads/video/exercise/thumbnail_image/thumb/'+video.thumb_image+'"><i class="fa fa-play" aria-hidden="true"></i> <em>play</em></a>';
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

exports.updateExerciseVideo = async (req, res, next) => {
  var id = req.body.id;
  await helper_video.getVideoDetail(id).then(async (row)=>{
    res.render('exercise/video-edit', {
        video: row
    });
  },err=>{
    res.render('exercise/video-edit', {
        error: err
    });
  });
}
