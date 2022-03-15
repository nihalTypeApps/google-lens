const dbConnection = require("../utils/dbConnection");
const helper_general = require("./general");
const helper_exercise = require("./exercise");
const async = require("async");
const axios = require('axios');

exports.getWorkouts = async (req, res, next) => {
  const columns = ['id','title','image','id'];
  let limit = req.body.length;
  let offset = req.body.start;
  let order = columns[req.body['order[0][column]']];
  let dir = req.body['order[0][dir]'];
  return new Promise((resolve, reject)=>{
      var where = {};
      if(req.body.title!==undefined){
        where['w.title LIKE ?'] = "%" + req.body.title + "%";
      }
      if(req.body.user_id!==undefined){
        where['w.user_id = ?'] = req.body.user_id;
      }
      else{
        where['w.user_id = ?'] = req.user.id;
      }
      if(req.body.is_finished!==undefined){
        where['w.is_finished = ?'] = req.body.is_finished;
      }
      where['w.is_archived = ?'] = req.body.is_archived;
      var conditions = helper_general.buildConditionsString(where);
      var sql;
      sql = "SELECT w.* FROM `workouts` AS w";
      sql+=" WHERE "+conditions.where;
      sql+=" ORDER BY w."+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
      dbConnection.execute(sql,conditions.values).then(async (row) => {
          row = JSON.parse(JSON.stringify(row));
          let tasks = [];
          row[0].forEach(async (item,index)=>{
            tasks.push(function(cb){
              workoutDuration(item.id).then((data)=>{
                row[0][index]['workout_duration'] = data;
                cb(null, data )
              },(err)=>{
                cb(null,err)
              })
            })
            tasks.push(function(cb){
              exports.workoutProgress(item.id).then((data)=>{
                row[0][index]['workout_progress_percentage'] = data;
                cb(null, data )
              },(err)=>{
                cb(null,err)
              })
            })
          });
          async.series(tasks,(err,result)=>{
            if(err){
              reject(err)
            }else{
              resolve(row[0]);
            }
          })

      }, (err) => {
          reject(err);
      })
  })
}

function workoutDuration(workout_id){
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT sum(e.duration) as workout_duration FROM `workouts_exercises` AS we";
    sql+=" LEFT JOIN `exercises` AS e ON(e.id = we.exercise_id)";
    sql+=" WHERE "+conditions.where;
    try{
      let row = await dbConnection.execute(sql,conditions.values);
      resolve((row[0][0].workout_duration > 0)?row[0][0].workout_duration:0);
    } catch(e){
      reject(e);
    }
});
}

exports.workoutProgress = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    try {
      let workout_progress = 0;
      let workout_actual_time =  await exports.getWorkoutActualTotalTime(workout_id);
      let workout_spend_time =  await exports.getWorkoutSpendTotalTime(workout_id);
      workout_progress = Math.round((parseInt(workout_spend_time)*100)/parseInt(workout_actual_time));
      resolve(workout_progress);
    }
    catch (e) {
      reject(e);
    }
  });

}

exports.getWorkoutActualTotalTime = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT sum(we.actual_duration) as total_actual_duration FROM `workouts_exercises` AS we";
    sql+=" WHERE "+conditions.where;
    let row = await dbConnection.execute(sql,conditions.values).then((row)=>{
      resolve(row[0][0].total_actual_duration);
    },(err)=>{
      reject(err.message);
    });
  });
}

exports.getWorkoutSpendTotalTime = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT sum(we.spend_duration) as total_spend_duration FROM `workouts_exercises` AS we";
    sql+=" WHERE "+conditions.where;
    let row = await dbConnection.execute(sql,conditions.values).then((row)=>{
      resolve(row[0][0].total_spend_duration);
    },(err)=>{
      reject(err.message);
    });
  });
}

exports.getWorkoutLeftotalTime = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT sum(we.left_duration) as total_left_duration FROM `workouts_exercises` AS we";
    sql+=" WHERE "+conditions.where;
    let row = await dbConnection.execute(sql,conditions.values).then((row)=>{
      resolve(row[0][0].total_left_duration);
    },(err)=>{
      reject(err.message);
    });
  });
}

exports.getWorkoutExerciseCount = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT count(we.id) as exercise_count FROM `workouts_exercises` AS we";
    sql+=" WHERE "+conditions.where;
    let row = await dbConnection.execute(sql,conditions.values).then((row)=>{
      resolve(row[0][0].exercise_count);
    },(err)=>{
      reject(err.message);
    });
  });
}

exports.getWorkoutDoneExerciseCount = (workout_id) => {
  return new Promise(async (resolve, reject)=>{
    var where = {};
    where['we.workout_id = ?'] = workout_id;
    where['we.status = ?'] = 'Done';
    var conditions = helper_general.buildConditionsString(where);
    sql = "SELECT count(we.id) as done_exercise_count FROM `workouts_exercises` AS we";
    sql+=" WHERE "+conditions.where;
    let row = await dbConnection.execute(sql,conditions.values).then((row)=>{
      resolve(row[0][0].done_exercise_count);
    },(err)=>{
      reject(err.message);
    });
  });
}

exports.getWorkDetail = async (req) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(req.body.id!==''){
      where['w.id = ?'] = req.body.id;
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT w.* FROM `workouts` as w";
    sql += " WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then(async(row) => {
        row = JSON.parse(JSON.stringify(row));
        if(row[0].length > 0){
            row[0][0]['workout_duration'] = await workoutDuration(row[0][0]['id']);
            row[0][0]['workout_left_duration'] = await this.getWorkoutLeftotalTime(row[0][0]['id']);
            row[0][0]['workout_actual_duration'] = await this.getWorkoutActualTotalTime(row[0][0]['id']);
            row[0][0]['workout_spend_duration'] = await this.getWorkoutSpendTotalTime(row[0][0]['id']);
            row[0][0]['workout_progress_percentage'] = await exports.workoutProgress(row[0][0]['id']);
            row[0][0]['image_original_path'] = process.env.BASE_URL+'/uploads/workout/'+row[0][0]['image'];
            row[0][0]['image_thumb_path'] = process.env.BASE_URL+'/uploads/workout/thumb/'+row[0][0]['image'];
            resolve(row[0][0]);
        }
        else{
          reject("Data does not exist.");
        }
    }, (err) => {
        reject(err.message);
    })
  });
}

exports.addBulkExerciseIntoWorkout = async (req, workout_id) => {
  var response = {};
  var error = [];
  let tasks = [];
  let exercises = req.body.exercises.split(",");
  let accessToken = req.body.token || req.query.token || req.headers["x-access-token"];
  let properties = (req.body.properties)?req.body.properties:[];
  exercises.forEach(async(id, index)=>{
    tasks.push(function(cb){
      req.body.id = id;
      let obj_exe = 'property_'+id;
      if(properties[obj_exe]){
        const options = {
          method: 'post',
          url:process.env.BASE_URL+'/api/add_exercise_into_workout',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': accessToken
          },
          data: JSON.stringify({
            workout_id: workout_id,
            exercise_id: id,
            reps: properties[obj_exe].reps,
            sets: properties[obj_exe].sets,
            weight: properties[obj_exe].weight,
            exercise_duration:parseInt(properties[obj_exe].exercise_duration*60)
          })
        };
        axios(options).then(response => {
          cb(null, response.data )
        })
        .catch((err)=>{
          cb(null,err)
        });
      }
      else{
        helper_exercise.getExerciseDetail(req).then(async(response)=>{
          const options = {
              method: 'post',
              url:process.env.BASE_URL+'/api/add_exercise_into_workout',
              headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  'x-access-token': accessToken
              },
              data: JSON.stringify({
                  workout_id: workout_id,
                  exercise_id: id,
                  reps: response.reps,
                  sets: response.sets,
                  weight: response.weight,
                  exercise_duration:parseInt(response.duration*60)
              })
          };
          axios(options).then(response => {
            cb(null, response.data )
          })
          .catch((err)=>{
            cb(null,err)
          });
        },(err)=>{
  
        });
      }
    });
  });
  async.series(tasks,(err,result)=>{
    if(err){
      console.log(err);
    }else{
      console.log(result);
    }
  });
}

exports.removeExistingExercises =  async (workout_id) => {
  return new Promise((resolve, reject)=>{
    try {
      var where = {};
      where['workout_id = ?'] = workout_id;
      var conditions = helper_general.buildDeleteConditionsString(where);
      var sql = "DELETE FROM `workouts_exercises` WHERE "+conditions.where;
      dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        resolve(row);
      }, (err) => {
        error.push(err.message);
        reject(error);
      })
    } catch(err) {
      reject(err);
    }
  });
}

exports.getWorkoutDetail = async (req) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(req.body.id!==''){
      where['id = ?'] = req.body.id;
      //where['b.user_id = ?'] = req.user.id;
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = '';
    sql += "SELECT * FROM `workouts`";
    sql += " WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then((row) => {
        row = JSON.parse(JSON.stringify(row));
        if(row[0].length > 0){
            row[0][0]['image_original_path'] = process.env.BASE_URL+'/uploads/workout/'+row[0][0]['image'];
            row[0][0]['image_thumb_path'] = process.env.BASE_URL+'/uploads/workout/thumb/'+row[0][0]['image'];
            resolve(row[0][0]);
        }
        else{
          reject("Data does not exist.");
        }
    }, (err) => {
        reject(err);
    })
  });
}

exports.getWorkoutExerciseDetail = async (req) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(req.body.id!==''){
      where['we.id = ?'] = req.body.id;
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT we.*,e.title,e.description,e.image FROM `workouts_exercises` as we";
    sql += " LEFT JOIN `exercises` as e ON(we.exercise_id = e.id)";
    sql += " WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then(async(row) => {
        row = JSON.parse(JSON.stringify(row));
        if(row[0].length > 0){
          row[0][0]['image_original_path'] = process.env.BASE_URL+'/uploads/exercise/'+row[0][0]['image'];
          row[0][0]['image_thumb_path'] = process.env.BASE_URL+'/uploads/exercise/thumb/'+row[0][0]['image'];
            resolve(row[0][0]);
        }
        else{
          reject("Data does not exist.");
        }
    }, (err) => {
        reject(err.message);
    })
  });
}
