const { validationResult } = require("express-validator");
const fs = require('fs');
const dbConnection = require("../../utils/dbConnection");
const helper_email = require("../../helpers/email");
const helper_general = require("../../helpers/general");
const helper_equipment = require("../../helpers/equipment");
const helper_image = require("../../helpers/image");
const helper_video = require("../../helpers/video");

exports.add_equipment = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  let image_name = '';
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    let uploadedFile = req.files.image;
    let fileExtension = uploadedFile.mimetype.split('/')[1];
    let msg = req.body.title;
    image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
    await uploadedFile.mv(`public/uploads/equipment/${image_name}`, (err ) => {
      if (err) {
        return res.status(500).send(err);
        error.push(err);
      }
      helper_image.resize(`public/uploads/equipment/${image_name}`,`public/uploads/equipment/thumb/${image_name}`,300,300);
    });
  }
  try {
    if(error.length == 0){
      var insert = {};
      insert['title'] = req.body.title;
      insert['description'] = req.body.description;
      insert['image'] = image_name;
      var conditions = helper_general.buildInsertConditionsString(insert);
      var sql = "INSERT INTO `equipments`("+conditions.inserts+") VALUES("+conditions.fields+")";
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        let insertId = row[0]['insertId'];
        response['status'] = '1';
        response['data']['message'] = "Data has been added successfully.";
        helper_general.createQrCode({"id":insertId,"source":"equipments"}).then(async (code)=>{
            var where = {};
            var update = {};
            where['id = ?'] = insertId;
            update['qr_code = ?'] = code;
            var conditions = helper_general.buildUpdateConditionsString(update, where);
            var sql = "UPDATE `equipments` SET "+conditions.updates+" WHERE "+conditions.where;
            await dbConnection.execute(sql,conditions.values);
        },(err)=>{
          error.push(err.message);
          response['data']['error'] = error;
        });
      }, (err) => {
        error.push(err.message);
        response['data']['error'] = error;
      })
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

exports.getEquipmentDetail = async (req, res, next) => {
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
      var id = req.body.id;
      await helper_equipment.getEquipmentDetail(req).then(row=>{
        response['status'] = '1';
        response['data']['equipment'] = row;
        if(req.xhr === true){
          res.render('equipment/equipment-edit', {
              equipment: row
          });
        }
        response['data']['message'] = "Data found";
      },
      err=>{
        if(req.xhr === true){
          res.render('equipment/equipment-edit', {
              error: err
          });
        }
        else{
            error.push(err);
            response['data']['error'] = error;
        }
      });
    }
    else{
      response['data']['error'] = error;
    }
    if(req.xhr === false){
      res.json(response);
    }
  } catch (e) {
    next(e);
  }
}

exports.updateEquipment = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  let image_name = '';
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  if(req.files!==null){
    let old_image = '';
    await helper_equipment.getEquipmentDetail(req).then(async (row)=>{
      old_image =  row.image;
      await helper_image.removeImage(`public/uploads/equipment/${old_image}`);
      await helper_image.removeImage(`public/uploads/equipment/thumb/${old_image}`);

      let uploadedFile = req.files.image;
      let fileExtension = uploadedFile.mimetype.split('/')[1];
      let msg = req.body.title;
      image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
      await uploadedFile.mv(`public/uploads/equipment/${image_name}`, (err ) => {
        if (err) {
          return res.status(500).send(err);
          error.push(err);
        }
      });
      await helper_image.resizeLargeFile(`public/uploads/equipment/${image_name}`,`public/uploads/equipment/thumb/${image_name}`,300,300);
    },
    err=>{
      error.push(err);
      response['data']['error'] = error;
    });
  }
  try {
    if(error.length == 0){
      var where = {};
      var update = {};
      if(image_name!==''){
        update['image = ?'] = image_name;
      }

      where['id = ?'] = req.body.id;
      update['title = ?'] = req.body.title;
      update['description = ?'] = req.body.description;

      var conditions = helper_general.buildUpdateConditionsString(update, where);
      var sql = "UPDATE `equipments` SET "+conditions.updates+" WHERE "+conditions.where;
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        response['status'] = '1';
        if(image_name!==''){
          response['data']['image_url'] = `/uploads/equipment/thumb/${image_name}`;
        }
        response['data']['message'] = "Data has been updated successfully.";
      }, (err) => {
        error.push(err.message);
        response['data']['error'] = error;
      })
    }
    else{
      response['data']['error'] = error;
    }
    console.log(response);
    res.json(response);
  }
  catch (e) {
    next(e);
  }
}

exports.deleteEquipment = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    await helper_equipment.getEquipmentDetail(req).then(async (row)=>{
      old_image =  row.image;
      await helper_image.removeImage(`public/uploads/equipment/${old_image}`);
      await helper_image.removeImage(`public/uploads/equipment/thumb/${old_image}`);
      await helper_image.removeImage(`public/uploads/equipment/qr_code/${row.qr_code}`);
    },
    err=>{
      error.push(err);
    });
  }
  try {
    if(error.length == 0){
      var where = {};
      where['id = ?'] = req.body.id;
      var conditions = helper_general.buildDeleteConditionsString(where);
      var sql = "DELETE FROM `equipments` WHERE "+conditions.where;
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        helper_video.deleteRelatedVideos(req.body.id, 'equipment');
        var d_where = {};
        d_where['equipment_id = ?'] = req.body.id;
        var d_conditions = helper_general.buildDeleteConditionsString(d_where);
        var sql = "DELETE FROM `equipments_exercises` WHERE "+d_conditions.where;
        dbConnection.execute(sql,d_conditions.values);
        response['status'] = '1';
        response['data']['message'] = "Data has been deleted successfully.";
      }, (err) => {
        error.push(err.message);
        response['data']['error'] = error;
      })
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

exports.getEquipmentListing = async (req, res, next) => {
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
      let start = parseInt(req.body.start);
      let length = parseInt(req.body.length);
      req.body.start = parseInt((++start*length)-length);
      req.body['order[0][column]'] = '0';
      req.body['order[0][dir]'] = 'asc';
      await helper_equipment.getEquipments(req).then((row)=>{
        if(row.length > 0){
          response['status'] = '1';
          row.forEach(function(item,index){
            row[index]['description'] = item.description.substr(0, 150);
            row[index]['image_original_path'] =  process.env.BASE_URL+'/uploads/equipment/'+item.image;
            row[index]['image_thumb_path'] = process.env.BASE_URL+'/uploads/equipment/thumb/'+item.image;
          });
          response['data']['equipments'] = row;
        }
        else{
          error.push("Data does not exist.");
          response['data']['error'] = error;
        }
      }, (err)=>{
        error.push(err);
        response['data']['error'] = error;
      });
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

exports.getEquipmentRelatedExercises = async (req, res, next) => {
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
      var sql = "SELECT exercises.id,exercises.image,exercises.title,exercises.duration FROM `equipments_exercises` LEFT JOIN `exercises` ON (equipments_exercises.exercise_id = exercises.id) WHERE equipments_exercises.equipment_id = ?";
      await dbConnection.execute(sql,[req.body.id]).then((row) => {
          row = JSON.parse(JSON.stringify(row));
          if(row[0].length > 0){
            row[0].forEach(function(item,index){
              row[0][index]['image_original_path'] = process.env.BASE_URL+'/uploads/exercise/'+item.image;
              row[0][index]['image_thumb_path'] = process.env.BASE_URL+'/uploads/exercise/thumb/'+item.image;
            });
            response['status'] = '1';
            response['data']['exercises'] = row[0];
          }
          else{
            error.push("data does not exist");
            response['data']['error'] = error;
          }
      }, (err) => {
        error.push(err.message);
        response['data']['error'] = error;
      })
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

exports.bookmarkEquipment = async (req, res, next) => {
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
      let action = req.body.action;
      var where = {}, insert = {};
      switch (action) {
        case 'add':{
          insert['type'] = 'equipment';
          insert['source_id'] = req.body.id;
          insert['user_id'] = req.user.id;
          var conditions = helper_general.buildInsertConditionsString(insert);
          var sql = "INSERT INTO `bookmarks`("+conditions.inserts+") VALUES("+conditions.fields+")";
          await dbConnection.execute(sql,conditions.values).then((row) => {
            response['status'] = '1';
            response['data']['bookmark_id'] = row[0]['insertId'];
            response['data']['message'] = "Bookmarked";
          }, (err) => {
            error.push(err.message);
            response['data']['error'] = error;
          })
        } break;
        case 'remove':{
          where['id = ?'] = req.body.id;
          where['user_id = ?'] = req.user.id;
          where['type = ?'] = 'equipment';
          var conditions = helper_general.buildDeleteConditionsString(where);
          var sql = "DELETE FROM `bookmarks` WHERE "+conditions.where;
          await dbConnection.execute(sql,conditions.values).then((row) => {
            if(row[0].affectedRows > 0){
              response['status'] = '1';
              response['data']['message'] = "Unbookmarked";
            }
            else{
              error.push("Bookmark does not exit.");
              response['data']['error'] = error;
            }
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
  } catch (e) {
    next(e);
  }
}

exports.getBookmarkEquipments = async (req, res, next) => {
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
      let limit = req.body.length;
      let offset = parseInt((++req.body.start*req.body.length)-req.body.length);;
      let order = 'b.id';
      let dir = 'desc';
      var where = {};
        where['b.user_id = ?'] = req.user.id;
        if(req.body.title!==undefined){
          where['e.title LIKE ?'] = "%" + req.body.title + "%";
        }
        var conditions = helper_general.buildConditionsString(where);
        var sql = "SELECT b.id as bookmark_id,e.* FROM `bookmarks` as b";
        sql += " LEFT JOIN `equipments` as e ON (b.source_id = e.id)";
        sql += " WHERE "+conditions.where;
        sql +=" ORDER BY "+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
        await dbConnection.execute(sql,conditions.values).then((row) => {
          row = JSON.parse(JSON.stringify(row));
          if(row[0].length > 0){
            row[0].forEach(function(item,index){
              row[0][index]['image_original_path'] = process.env.BASE_URL+'/uploads/equipment/'+item.image;
              row[0][index]['image_thumb_path'] = process.env.BASE_URL+'/uploads/equipment/thumb/'+item.image;
            });
            response['status'] = '1';
            response['data']['exercises'] = row[0];
          }
          else{
            error.push("data does not exist");
            response['data']['error'] = error;
          }
        }, (err) => {
          error.push(err.message);
          response['data']['error'] = error;
        })
    }
    else{
      response['data']['error'] = error;
    }
    res.json(response);
  } catch (e) {
    next(e);
  }
}

exports.getEquipmentsCount = async (req, res, next) => {
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  try{
    var where = {};
    where['1 = ?'] = 1;
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT count(e.id) as count";
    sql += " FROM `equipments` as e";
    sql += " WHERE "+conditions.where;
    await dbConnection.execute(sql,conditions.values).then((row) => {
      if(row[0].length >= 0){
        response['status'] = '1';
        response['data']['count_is'] = row[0][0].count;
      }
      else{
        error.push("data does not exist");
        response['data']['error'] = error;
      }
    }, (err) => {
      error.push(err.message);
      response['data']['error'] = error;
    })
    res.json(response);
  } catch (e) {
    next(e);
  }
}
