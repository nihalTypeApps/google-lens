const { validationResult } = require("express-validator");
const dbConnection = require("../../utils/dbConnection");
const helper_general = require("../../helpers/general");
const helper_workout = require("../../helpers/workout");
const helper_image = require("../../helpers/image");

exports.addWorkout = async (req, res, next) => {
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
      let image_dir = 'public/uploads/workout';
      let thumb_image_dir = 'public/uploads/workout/thumb';
      if(req.body.image_type_format === 'base64'){
        if(req.body.image && req.body.image!==undefined){
          let image_info = helper_image.getBase64ImageInfo(req.body.image);
          let fileExtension = image_info.extention;
          image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
          await helper_image.createDirectories([image_dir,thumb_image_dir]).then(async (res)=>{
            helper_image.uploadBase64Image(image_info.image_string, image_dir, image_name);
            helper_image.resize(image_dir+`/${image_name}`,thumb_image_dir+`/${image_name}`,300,300);
          });
      }
      }
      else{
        if(req.files.image !== undefined){
          let uploadedFile = req.files.image;
          let fileExtension = uploadedFile.mimetype.split('/')[1];
          image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
          await helper_image.createDirectories([image_dir,thumb_image_dir]).then(async (res)=>{
            await uploadedFile.mv(image_dir+`/${image_name}`, (err ) => {
              if (err) {
                error.push(err);
              }
              helper_image.resize(image_dir+`/${image_name}`,thumb_image_dir+`/${image_name}`,300,300);
            });
          });
        }
      }
    }
    try {
      if(error.length == 0){
        var insert = {};
        insert['title'] = req.body.title;
        insert['user_id'] = req.user.id;
        insert['schedule_time'] = req.body.schedule_time;
        insert['schedule_date'] = req.body.schedule_date;
        insert['description'] = req.body.description;
        insert['image'] = image_name;
        insert['warmup_time'] = req.body.warmup_time; 
        var conditions = helper_general.buildInsertConditionsString(insert);
        var sql = "INSERT INTO `workouts`("+conditions.inserts+") VALUES("+conditions.fields+")";
        await dbConnection.execute(sql,conditions.values).then(async (row) => {
          //ResultSetHeader
          if(req.body.exercises !== ''){
             helper_workout.addBulkExerciseIntoWorkout(req, row[0]['insertId']);
          }
          response['status'] = '1';
          response['data']['workout_id'] = row[0]['insertId'];
          response['data']['message'] = "Workout has been added successfully.";
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

  exports.addExerciseIntoWorkout = async (req, res, next) => {
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
        var insert = {};
        insert['workout_id'] = req.body.workout_id;
        insert['exercise_id'] = req.body.exercise_id;
        insert['reps'] = req.body.reps;
        insert['sets'] = req.body.sets;
        insert['weight'] = req.body.weight;
        insert['actual_duration'] = req.body.exercise_duration;
        insert['left_duration'] = req.body.exercise_duration;
        insert['status'] = 'Pending';
        var conditions = helper_general.buildInsertConditionsString(insert);
        var sql = "INSERT INTO `workouts_exercises`("+conditions.inserts+") VALUES("+conditions.fields+")";
        await dbConnection.execute(sql,conditions.values).then((row) => {
          response['status'] = '1';
          response['data']['message'] = "Added successfully.";
        }, (err) => {
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

  exports.removeExerciseFromWorkout = async (req, res, next) => {
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
        where['id = ?'] = req.body.id;
        var conditions = helper_general.buildDeleteConditionsString(where);
        var sql = "DELETE FROM `workouts_exercises` WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((row) => {
          response['status'] = '1';
          response['data']['message'] = "Deleted successfully.";
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

  exports.reorderWorkoutExercise = async (req, res, next) => {
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
        let ids = req.body.ids;
        let count = 1;
        ids.forEach((id)=>{
          var where = {};
          var update = {};
          where['id = ?'] = id;
          update['position = ?'] = count;
          var conditions = helper_general.buildUpdateConditionsString(update, where);
          var sql = "UPDATE `workouts_exercises` SET "+conditions.updates+" WHERE "+conditions.where;
          dbConnection.execute(sql,conditions.values);
          count++;
        });
        response['status'] = '1';
        response['data']['message'] = "success.";
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

  exports.workoutExerciseRestTime = async (req, res, next) => {
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

        var where = {}, update = {};
        where['id = ?'] = req.body.id;
        switch (action) {
          case 'add':{
            let rest_time = req.body.rest_time;
            update['rest_time = ?'] = rest_time;
          } break;
          case 'remove':{
            update['rest_time = ?'] = null;
          } break;
        }
        var conditions = helper_general.buildUpdateConditionsString(update, where);
        var sql = "UPDATE `workouts_exercises` SET "+conditions.updates+" WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((res)=>{
          response['status'] = '1';
          response['data']['message'] = (action === 'add')?"added":"removed";
        }, (err)=>{
          error.push(err.message);
          response['data']['error'] = error;
        });
      }
      else{
        response['data']['error'] = error;
      }
      res.json(response);
    } catch (e) {
      next(e);
    }
  }

  exports.getWorkoutExerciseList = async (req, res, next) => {
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
          where['we.workout_id = ?'] = req.body.id;
          var conditions = helper_general.buildConditionsString(where);
          var sql = "SELECT we.id,we.left_duration,we.actual_duration,we.rest_time,we.status,we.reps,we.sets,we.weight,e.id as exercise_id,e.title,e.image FROM `workouts_exercises` as we";
          sql += " LEFT JOIN `exercises` as e ON (we.exercise_id = e.id)";
          sql += " WHERE "+conditions.where;
          sql+=" ORDER BY we.position ASC";
          await dbConnection.execute(sql,conditions.values).then((row) => {
            row = JSON.parse(JSON.stringify(row));
            if(row[0].length > 0){
              row[0].forEach(function(item,index){
                row[0][index]['left_duration'] = (item.left_duration !== 0) ? item.left_duration:0;
                row[0][index]['rest_time'] = (item.rest_time !== null) ? item.rest_time:0;
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
    } catch (e) {
      next(e);
    }
  }

  exports.getWorkouts = async (req, res, next) => {
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
        req.body['order[0][dir]'] = 'desc';
        await helper_workout.getWorkouts(req).then((row)=>{
          row = JSON.parse(JSON.stringify(row));
          if(row.length > 0){
            row.forEach(function(item,index){
              row[index]['image_original_path'] = process.env.BASE_URL+'/uploads/workout/'+item.image;
              row[index]['image_thumb_path'] = process.env.BASE_URL+'/uploads/workout/thumb/'+item.image;
            });
            response['status'] = '1';
            response['data']['workouts'] = row;
          }
          else{
            error.push("Data does not exist.");
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

  exports.updateWorkoutExerciseDuration = async(req, res, next) =>{
    const errors = validationResult(req);
    var error = [];
    var response = {};
    response['status'] = '0';
    response['data'] = {};
    if (!errors.isEmpty()) {
      error.push(errors.array()[0].msg);
    }

    try{
      if(error.length == 0){
        var where = {};
        var update = {};
        where['id = ?'] = req.body.id;
        update['left_duration = ?'] = req.body.left_duration;
        update['spend_duration = ?'] = parseInt(req.body.actual_duration - req.body.left_duration);
        update['status = ?'] = req.body.status;
        var conditions = helper_general.buildUpdateConditionsString(update, where);
        var sql = "UPDATE `workouts_exercises` SET "+conditions.updates+" WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((row)=>{
          response['status'] = '1';
          response['data']['message'] = "Success";
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

  exports.getWorkoutDetail = async(req, res, next) => {
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
        await helper_workout.getWorkDetail(req).then(row=>{
          response['status'] = '1';
          response['data']['workout'] = row;
          response['data']['message'] = "Data found";
        },
        err=>{
          error.push(err);
          response['data']['error'] = error;
        });
      }
      else{
        response['data']['error'] = error;
      }
      res.json(response);
    } catch (e) {
      next(e);
    }
  }

  exports.finishWorkout = async (req, res, next) => {
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
        var update = {};
        where['id = ?'] = req.body.id;
        update['is_finished = ?'] = '1';
        var conditions = helper_general.buildUpdateConditionsString(update, where);
        var sql = "UPDATE `workouts` SET "+conditions.updates+" WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((row)=>{
          response['status'] = '1';
          response['data']['message'] = "Success";
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

    }
  }

  exports.archiveWorkout = async (req, res, next) => {
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
        var where = {}, update = {};
        where['id = ?'] = req.body.id;
        switch (action) {
          case 'add':{
            update['is_archived = ?'] = '1';
          } break;
          case 'restore':{
            update['is_archived = ?'] = '0';
          } break;
        }
        var conditions = helper_general.buildUpdateConditionsString(update, where);
        var sql = "UPDATE `workouts` SET "+conditions.updates+" WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((row) => {
          response['status'] = '1';
          response['data']['message'] = "Success.";
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

  exports.deleteWorkout = async (req, res, next) => {
    const errors = validationResult(req);
    var error = [];
    var response = {};
    response['status'] = '0';
    response['data'] = {};
    if (!errors.isEmpty()) {
      error.push(errors.array()[0].msg);
    }
    else{
      await helper_workout.getWorkoutDetail(req).then(async (row)=>{
        old_image =  row.image;
        await helper_image.removeImage(`public/uploads/workout/${old_image}`);
        await helper_image.removeImage(`public/uploads/workout/thumb/${old_image}`);
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
        var sql = "DELETE FROM `workouts` WHERE "+conditions.where;
        await dbConnection.execute(sql,conditions.values).then((row) => {
          //ResultSetHeader
          helper_workout.removeExistingExercises(req.body.id);
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

  exports.addBulkExerciseIntoWorkout = async (req, res, next) => {
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
        await helper_workout.addBulkExerciseIntoWorkout(req, req.body.workout_id).then((res)=>{
          response['status'] = '1';
          response['data']['message'] = "Data has been saved successfully.";
        }, (err)=>{
          response['data']['error'] = err;
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

  exports.getUnselectedExercises = async (req, res, next) => {
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
        if(req.body.exercises!=''){
            var exercises = req.body.exercises;
            exercises = exercises.split(",");
            where['id NOT IN (?)'] = exercises;
        }
        var conditions = helper_general.buildConditionsString(where);
        sql = "SELECT exercises.* FROM `exercises` WHERE "+conditions.where;
        sql+=" ORDER BY exercises.id ASC";
        await dbConnection.query(sql,conditions.values).then((row) => {
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
    } catch (e) {
      next(e);
    }
  }

  exports.updateWorkout = async (req, res, next) => {
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
        if((req.body.image && req.body.image!==null) || (req.files && req.files!==null)){
          let old_image = '';
          let image_dir = 'public/uploads/workout';
          let thumb_image_dir = 'public/uploads/workout/thumb';
          await helper_workout.getWorkoutDetail(req).then(async (row)=>{
            old_image =  row.image;
            await helper_image.removeImage(image_dir+`/${old_image}`);
            await helper_image.removeImage(thumb_image_dir+`/${old_image}`);

            if(req.body.image_type_format === 'base64'){
              if(req.body.image && req.body.image!==undefined){
                let image_info = helper_image.getBase64ImageInfo(req.body.image);
                let fileExtension = image_info.extention;
                image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
                await helper_image.createDirectories([image_dir,thumb_image_dir]).then(async (res)=>{
                helper_image.uploadBase64Image(image_info.image_string, image_dir, image_name);
                helper_image.resize(image_dir+`/${image_name}`,thumb_image_dir+`/${image_name}`,300,300);
                });
              }
            }
            else{
              if(req.files.image !== undefined){
                let uploadedFile = req.files.image;
                let fileExtension = uploadedFile.mimetype.split('/')[1];
                image_name = Date.now()+'-'+req.body.title.replace(/\s+/g, "-")+'.' + fileExtension;
                await helper_image.createDirectories([image_dir,thumb_image_dir]).then(async (res)=>{
                  await uploadedFile.mv(image_dir+`/${image_name}`, (err ) => {
                    if (err) {
                      error.push(err);
                    }
                    helper_image.resize(image_dir+`/${image_name}`,thumb_image_dir+`/${image_name}`,300,300);
                  });
                });
              }
            }
          },
          err=>{
            error.push(err);
            response['data']['error'] = error;
          });
        }
      }
      try {
        if(error.length == 0){
          var where = {};
          var update = {};
          var workout_id = req.body.id;
          where['id = ?'] = workout_id;
          update['title = ?'] = req.body.title;
          update['schedule_time = ?'] = req.body.schedule_time;
          update['schedule_date = ?'] = req.body.schedule_date;
          update['description = ?'] = req.body.description;
          update['warmup_time = ?'] = req.body.warmup_time;
          if(image_name!=''){
              update['image = ?'] = image_name;
          }
          var conditions = helper_general.buildUpdateConditionsString(update, where);
          var sql = "UPDATE `workouts` SET "+conditions.updates+" WHERE "+conditions.where;
          await dbConnection.execute(sql,conditions.values).then(async (row) => {
            //ResultSetHeader
            if(req.body.exercises !== ''){
               helper_workout.addBulkExerciseIntoWorkout(req, workout_id);
            }
            response['status'] = '1';
            response['data']['workout_id'] = workout_id;
            response['data']['message'] = "Workout has been updated successfully.";
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

    exports.getWorkoutExerciseDetail = async(req, res, next) => {
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
          await helper_workout.getWorkoutExerciseDetail(req).then(row=>{
            response['status'] = '1';
            response['data']['workout'] = row;
            response['data']['message'] = "Data found";
          },
          err=>{
            error.push(err);
            response['data']['error'] = error;
          });
        }
        else{
          response['data']['error'] = error;
        }
        res.json(response);
      } catch (e) {
        next(e);
      }
    }

    exports.updateWorkoutExerciseDetail = async(req, res, next) =>{
      const errors = validationResult(req);
      var error = [];
      var response = {};
      response['status'] = '0';
      response['data'] = {};
      if (!errors.isEmpty()) {
        error.push(errors.array()[0].msg);
      }
  
      try{
        if(error.length == 0){
          var where = {};
          var update = {};
          var actual_duration = parseInt(req.body.workout_exercise_actual_duration);
          var spend_duration = parseInt(req.body.workout_exercise_spend_duration);
          var left_duration = parseInt(req.body.workout_exercise_left_duration);

          left_duration = (actual_duration<spend_duration)?0:(actual_duration-spend_duration);
          spend_duration = (actual_duration<spend_duration)?actual_duration:spend_duration;

          where['id = ?'] = req.body.workout_exercise_id;

          update['reps = ?'] = req.body.workout_exercise_reps;
          update['sets = ?'] = req.body.workout_exercise_sets;
          update['weight = ?'] = req.body.workout_exercise_weight;
          update['actual_duration = ?'] = actual_duration;
          update['left_duration = ?'] = left_duration;
          update['spend_duration = ?'] = spend_duration;
          
          var conditions = helper_general.buildUpdateConditionsString(update, where);
          var sql = "UPDATE `workouts_exercises` SET "+conditions.updates+" WHERE "+conditions.where;
          await dbConnection.execute(sql,conditions.values).then((row)=>{
            response['status'] = '1';
            response['data']['message'] = "Success";
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
exports.getWorkoutsCount = async (req, res, next) => {
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  try{
    var where = {};
    where['1 = ?'] = 1;
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT count(w.id) as count";
    sql += " FROM `workouts` as w";
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