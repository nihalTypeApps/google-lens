const { validationResult } = require("express-validator");
const fs = require('fs');
const dbConnection = require("../../utils/dbConnection");
const helper_general = require("../../helpers/general");
const helper_image = require("../../helpers/image");
const helper_video = require("../../helpers/video");

exports.uploadVideo = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  let image_name = '';
  let video_file_name = '';
  let video_file_url = '';
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    if(req.files.thumb_image !== undefined){
      let uploadedFile = req.files.thumb_image;
      let fileExtension = uploadedFile.mimetype.split('/')[1];
      image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
      let thumbnail_image_dir = 'public/uploads/video/'+req.body.type+'/thumbnail_image';
      let thumbnail_thumb_image_dir = 'public/uploads/video/'+req.body.type+'/thumbnail_image/thumb';
      await helper_image.createDirectories([thumbnail_image_dir,thumbnail_thumb_image_dir]).then(async (res)=>{
        await uploadedFile.mv(thumbnail_image_dir+`/${image_name}`, (err ) => {
          if (err) {
            error.push(err);
          }
          helper_image.resize(thumbnail_image_dir+`/${image_name}`,thumbnail_thumb_image_dir+`/${image_name}`,300,300);
        });
      });
    }
    if(req.files.video !== undefined){
      let uploadedFile = req.files.video;
      let fileExtension = uploadedFile.mimetype.split('/')[1];
      video_file_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
      await helper_video.uploadFile(req.files.video.data,req.body.type+'/'+video_file_name).then((fileUrl)=>{
        video_file_url = fileUrl;
      },(err)=>{
        error.push(err);
      });
    }
  }
  try {
    if(error.length == 0){
      var insert = {};
      insert['title'] = req.body.title;
      insert['type'] = req.body.type;
      insert['source_id'] = req.body.source_id;
      insert['thumb_image'] = image_name;
      insert['video'] = video_file_url;
      var conditions = helper_general.buildInsertConditionsString(insert);
      var sql = "INSERT INTO `videos`("+conditions.inserts+") VALUES("+conditions.fields+")";
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        response['status'] = "1";
        response['data']['video_url'] = video_file_url;
        response['data']['message'] = "Uploaded successfully.";
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

exports.deleteVideo = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    await helper_video.getVideoDetail(req.body.id).then(async (row)=>{
      old_image =  row.thumb_image;
      await helper_image.removeImage(`public/uploads/video/${row.type}/thumbnail_image/${old_image}`);
      await helper_image.removeImage(`public/uploads/video/${row.type}/thumbnail_image/thumb/${old_image}`);
      await helper_video.deleteFile(row.video).then((res)=>{
        console.log(res);
      },err=>{
        console.log(err);
        error.push(err);
      });
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
      var sql = "DELETE FROM `videos` WHERE "+conditions.where;
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
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


exports.updateVideo = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  let image_name = '';
  let video_file_name = '';
  let video_file_url = '';
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    await helper_video.getVideoDetail(req.body.id).then(async (row)=>{
      if(req.files !== null && req.files.thumb_image!==undefined){
        let uploadedFile = req.files.thumb_image;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;

        let thumbnail_image_dir = `public/uploads/video/${row.type}/thumbnail_image`;
        let thumbnail_thumb_image_dir = `public/uploads/video/${row.type}/thumbnail_image/thumb`;

        await helper_image.createDirectories([thumbnail_image_dir,thumbnail_thumb_image_dir]).then(async (res)=>{
          await uploadedFile.mv(thumbnail_image_dir+`/${image_name}`, (err ) => {
            if (err) {
              error.push(err);
            }
          });
          await helper_image.resizeLargeFile(thumbnail_image_dir+`/${image_name}`,thumbnail_thumb_image_dir+`/${image_name}`,300,300);
        });
        await helper_image.removeImage(thumbnail_image_dir+`/${row.thumb_image}`);
        await helper_image.removeImage(thumbnail_thumb_image_dir+`/${row.thumb_image}`);
      }

      if(req.files !== null && req.files.video!==undefined){
        let uploadedFile = req.files.video;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        video_file_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
        await helper_video.deleteFile(row.video).then((res)=>{
          console.log("deleteFile res");
          console.log(res);
        },err=>{
          console.log("deleteFile err");
          console.log(err);
          error.push(err);
        });
        await helper_video.uploadFile(req.files.video.data,row.type+'/'+video_file_name).then((fileUrl)=>{
          video_file_url = fileUrl;
        },(err)=>{
          error.push(err);
        });
      }
    },
    err=>{
      error.push(err);
    });
  }
  try {
    if(error.length == 0){
      var where = {};
      var update = {};
      if(image_name!==''){
        update['thumb_image = ?'] = image_name;
      }
      if(video_file_url!==''){
        update['video = ?'] = video_file_url;
      }
      update['title = ?'] = req.body.title;
      where['id = ?'] = req.body.id;
      var conditions = helper_general.buildUpdateConditionsString(update, where);
      var sql = "UPDATE `videos` SET "+conditions.updates+" WHERE "+conditions.where;
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        response['status'] = '1';
        response['data']['message'] = "Data has been updated successfully.";
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

exports.getEquipmentRelatedVideos = async (req, res, next) => {
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
      var where = {};
        where['source_id = ?'] = req.body.id;
        where['type = ?'] = 'equipment';
        var conditions = helper_general.buildConditionsString(where);
        var sql = "SELECT * FROM `videos`  WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((row) => {
            if(row[0].length > 0){
              row[0].forEach(function(item,index){
                row[0][index]['thumbnail_image_original_path'] =  process.env.BASE_URL+'/uploads/video/equipment/thumbnail_image/'+item.thumb_image;
                row[0][index]['thumbnail_image_thumb_path'] = process.env.BASE_URL+'/uploads/video/equipment/thumbnail_image/thumb/'+item.thumb_image;
              });
              response['status'] = '1';
              response['data']['videos'] = row[0];
              response['data']['message'] = "Data found.";
            }
            else{
              error.push('Data not found.');
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
    console.log(response);
    res.json(response);
  }
  catch (e) {
    next(e);
  }
}

exports.getExerciseRelatedVideos = async (req, res, next) => {
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
      var where = {};
        where['source_id = ?'] = req.body.id;
        where['type = ?'] = 'exercise';
        var conditions = helper_general.buildConditionsString(where);
        var sql = "SELECT * FROM `videos`  WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((row) => {
            if(row[0].length > 0){
              row[0].forEach(function(item,index){
                row[0][index]['thumbnail_image_original_path'] =  process.env.BASE_URL+'/uploads/video/exercise/thumbnail_image/'+item.thumb_image;
                row[0][index]['thumbnail_image_thumb_path'] = process.env.BASE_URL+'/uploads/video/exercise/thumbnail_image/thumb/'+item.thumb_image;
              });
              response['status'] = '1';
              response['data']['videos'] = row[0];
              response['data']['message'] = "Data found.";
            }
            else{
              error.push('Data not found.');
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
    console.log(response);
    res.json(response);
  }
  catch (e) {
    next(e);
  }
}

exports.deleteVideos = async (req, res, next) => {
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
      var where = {};
        where['source_id = ?'] = req.body.id;
        where['type = ?'] = req.body.type;
        var conditions = helper_general.buildConditionsString(where);
        var sql = "SELECT * FROM `videos`  WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then(async (row) => {
          if(row[0].length > 0){
            var videos = row[0];
              await videos.forEach(async function(video,index){
                old_image =  video.thumb_image;
                helper_image.removeImage(`public/uploads/video/${video.type}/thumbnail_image/${old_image}`);
                helper_image.removeImage(`public/uploads/video/${video.type}/thumbnail_image/thumb/${old_image}`);
                await helper_video.deleteFile(video.video).then(async (res)=>{
                  var where = {};
                  where['id = ?'] = video.id;
                  var conditions = helper_general.buildDeleteConditionsString(where);
                  var sql = "DELETE FROM `videos` WHERE "+conditions.where;
                  await dbConnection.execute(sql,conditions.values).then((row) => {
                    //ResultSetHeader
                  }, (err) => {
                      error.push(err.message);
                      response['data']['error'] = error;
                  })
                },(err)=>{
                  error.push(err.message);
                  response['data']['error'] = error;
                });
              });
              response['status'] = '1';
              response['data']['message'] = "Data has been deleted successfully.";
          }
          else{
            error.push('No videos found.');
            response['data']['error'] = error;
          }
        }, (err)=>{
          error.push(err.message);
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
