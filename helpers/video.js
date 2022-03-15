const dbConnection = require("../utils/dbConnection");
const axios = require('axios');
const helper_general = require("./general");
const AWS = require('aws-sdk');
const async = require("async");

exports.uploadFile_old =  async (file,destination_path) => {
  return new Promise((resolve, reject)=>{
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
      });

      //const fileContent = fs.readFileSync(original_path);
      const fileContent  = Buffer.from(file, 'binary');
      const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: destination_path, // File name you want to save as in S3
          Body: fileContent
      };

      // Uploading files to the bucket
      s3.upload(params, function(err, data) {
          if (err) {
              console.error(err);
              reject(err);
          }
          resolve(data.Location);
      });
    } catch(err) {
      console.error(err);
      reject(err);
    }
  });
}

exports.uploadFile =  async (file,destination_path) => {
  return new Promise((resolve, reject)=>{
    try {
      let tasks = [];
      const s3 = new AWS.S3({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
      });

      //const fileContent = fs.readFileSync(original_path);
      const fileContent  = Buffer.from(file, 'binary');
      const params = {
          Bucket: process.env.BUCKET_NAME,
          Key: destination_path, // File name you want to save as in S3
          Body: fileContent
      };

      // Uploading files to the bucket
      tasks.push(function(cb){
        s3.upload(params, function(err, data) {
          if (err) {
            console.error(err);
            reject(err);
            cb(null,err)
          }
          resolve(data.Location);
          cb(null, data.Location )
        });
      })

      async.series(tasks,(err,result)=>{
        if(err){
          reject(err)
        }else{
          resolve(result);
        }
      })
    } catch(err) {
      console.error(err);
      reject(err);
    }
  });
}

exports.deleteFile =  async (destination_path) => {
  return new Promise((resolve, reject)=>{
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
      });
      var aws_path = destination_path.replace('https://axces.s3.ap-southeast-2.amazonaws.com/','');
      aws_path = aws_path.replace('https://axces.s3.amazonaws.com/','');
      console.log(aws_path);
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: aws_path
      };
      s3.deleteObject(params, function(err, data){
        if(err){
          reject(err);
        }
        resolve(data);
      });
    } catch(err) {
      reject(err);
    }
  });
}

exports.getVideos = async (req, res, next) => {
  const columns = ['id','title','thumb_image','id'];
  let limit = req.body.length;
  let offset = req.body.start;
  let order = columns[req.body['order[0][column]']];
  let dir = req.body['order[0][dir]'];
  return new Promise((resolve, reject)=>{
      var where = {};
      where['type = ?'] = req.body.type;
      where['source_id = ?'] = req.body.source_id;
      var conditions = helper_general.buildConditionsString(where);
      var sql;
      sql = "SELECT videos.* FROM `videos` WHERE "+conditions.where;
      sql+=" ORDER BY "+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
      dbConnection.execute(sql,conditions.values).then((row) => {
          row = JSON.parse(JSON.stringify(row));
          resolve(row[0]);
      }, (err) => {
          reject(err);
      })
  })
}

exports.getVideosCount = async (req, res, next) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    where['type = ?'] = req.body.type;
    where['source_id = ?'] = req.body.source_id;
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT id FROM `videos` WHERE "+conditions.where;
      dbConnection.execute(sql,conditions.values).then((row) => {
          resolve(row[0].length);
      }, (err) => {
          reject(err);
      })
  })
}

exports.getVideoDetail = async (id) => {
  return new Promise((resolve, reject)=>{
    var where = {};
    if(id!==''){
      where['id = ?'] = id;
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT * FROM `videos` WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then((row) => {
        row = JSON.parse(JSON.stringify(row));
        if(row[0].length > 0){
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

exports.deleteRelatedVideos = async (id, type) => {
    const options = {
        method: 'post',
        url:process.env.BASE_URL+'/api/delete_videos',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': accessToken
        },
        data: JSON.stringify({
            id: id,
            type: type
        })
    };
    return axios(options);
}
