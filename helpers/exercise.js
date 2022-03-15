const dbConnection = require("../utils/dbConnection");
const exercises = require('../models/Exercises');
const helper_general = require("./general");
exports.getExercises = async (req, res, next) => {
  const columns = ['_id','title','image','_id'];
  let limit = req.body.length;
  let offset = req.body.start;
  let order = columns[req.body['order[0][column]']];
  let dir = req.body['order[0][dir]'];
  let sort = {}
  sort[order] = dir;
  console.log(sort);
  return new Promise(async (resolve, reject)=>{
     let where = {};
      if(req.body.title!==""){
        where['title'] = new RegExp(req.body.title, 'i');
      }
      await exercises.find(where).sort(sort).limit(limit).skip(offset).then(row=>{
        resolve(row);
      }).catch(err =>{
        reject(err);
      });
  })
}

exports.getExercisesCount = async (req, res, next) => {
  return new Promise(async (resolve, reject)=>{
    let where = {};
      if(req.body.title!==""){
        where['title'] = new RegExp(req.body.title, 'i');
      }
    await exercises.find(where).then(row=>{
      resolve(row.length);
    }).catch(err =>{
      reject(err);
    });
  })
}

exports.getExerciseDetail = async (req) => {
  return new Promise(async (resolve, reject)=>{
    var where = {};
    if(req.body.id!==''){
      where['_id'] = req.body.id;
    }
    await exercises.find(where).then(row=>{
      resolve(row[0]);
    }).catch(err =>{
      reject(err);
    });
  });
}

exports.deleteExerciseVideos = async (id = '') => {

}
