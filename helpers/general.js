const dbConnection = require("../utils/dbConnection");
const users = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const fs = require('fs');
var QRCode = require("qrcode");

exports.insertDeviceToken = async (user_id,device_type,device_token) => {
  return new Promise((resolve, reject)=>{
        var insert = {};
        insert['user_id'] = user_id;
        insert['device_type'] = device_type;
        insert['device_token'] = device_token;
        insert['status'] = '1';
        this.disableDeviceTokens(device_token);
        var conditions = this.buildInsertConditionsString(insert);
        var sql = "INSERT INTO `devices`("+conditions.inserts+") VALUES("+conditions.fields+")";
        dbConnection.execute(sql,conditions.values).then(async (row) => {
          if(row[0]['insertId']){
            resolve(row[0]['insertId']);
          }
          else{
            reject("Unable to insert device token.");
          }
        }, (err) => {
            reject(err);
        });
    })
}

exports.updateDeviceToken = async (user_id,device_type,device_token) => {
  return new Promise((resolve, reject)=>{
        var where = {};
        var update = {};
        where['user_id = ?'] = user_id;
        update['device_type = ?'] = device_type;
        update['device_token = ?'] = device_token;
        update['status = ?'] = '1';
        this.disableDeviceTokens(device_token);
        var conditions = this.buildUpdateConditionsString(update, where);
        var sql = "UPDATE `devices` SET "+conditions.updates+" WHERE "+conditions.where;
        dbConnection.execute(sql,conditions.values).then(async (row) => {
          resolve("Data has been updated successfully.");
        }, (err) => {
            reject(err);
        });
    })
}

exports.disableDeviceTokens = async (device_token) => {
  return new Promise((resolve, reject)=>{
        var where = {};
        var update = {};
        where['device_token = ?'] = device_token;
        update['status = ?'] = '0';
        var conditions = this.buildUpdateConditionsString(update, where);
        var sql = "UPDATE `devices` SET "+conditions.updates+" WHERE "+conditions.where;
        dbConnection.execute(sql,conditions.values).then(async (row) => {
          resolve("Data has been updated successfully.");
        }, (err) => {
            reject(err);
        });
    })
}

exports.getOtherUserDetail = async (user_id) => {
  return new Promise((resolve, reject)=>{
        dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [user_id]).then((row) => {
            if(row[0].length > 0){
                row[0][0]['image_original_path'] = (row[0][0].image!='')?process.env.BASE_URL+'/uploads/user/'+row[0][0].image:process.env.BASE_URL+'/assets/profile/dummy-profile-image.jpg';
                row[0][0]['image_thumb_path'] = (row[0][0].image!='')?process.env.BASE_URL+'/uploads/user/thumb/'+row[0][0].image:process.env.BASE_URL+'/assets/profile/dummy-profile-image.jpg';
                resolve(row[0][0]);
            }
            else{
              reject("User does not exist.");
            }
        }, (err) => {
            reject(err);
        })
    })
}

exports.getOtherUserDetailByEmail = async (email) => {
  return new Promise(async (resolve, reject)=>{
    await users.find({'email':email}).then(row=>{
      if(row.length > 0){
        row[0]['image_original_path'] = (row[0].image!='')?process.env.BASE_URL+'/uploads/user/'+row[0].image:process.env.BASE_URL+'/assets/profile/dummy-profile-image.jpg';
        row[0]['image_thumb_path'] = (row[0].image!='')?process.env.BASE_URL+'/uploads/user/thumb/'+row[0].image:process.env.BASE_URL+'/assets/profile/dummy-profile-image.jpg';
        resolve(row[0]);
      }else{
          reject("User does not exist.");
      }
    }).catch(err =>{
      reject(err);
    });
  });
}

exports.emailExist = async (items) => {
  return new Promise((resolve, reject)=>{
    var conditions = this.buildConditionsString(items);
    var sql = "SELECT id FROM `users` WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then((row) => {
        resolve(row[0].length);
    }, (err) => {
        reject(err);
    })
});
}

exports.workoutExerciseExist = async (items) => {
  return new Promise((resolve, reject)=>{
    var conditions = this.buildConditionsString(items);
    var sql = "SELECT id FROM `workouts_exercises` WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then((row) => {
        resolve(row[0].length);
    }, (err) => {
        reject(err);
    })
});
}

exports.bookmarkExist = async (items) => {
  return new Promise((resolve, reject)=>{
    var conditions = this.buildConditionsString(items);
    var sql = "SELECT id FROM `bookmarks` WHERE "+conditions.where;
    dbConnection.execute(sql,conditions.values).then((row) => {
        resolve(row[0].length);
    }, (err) => {
        reject(err);
    })
});
}

exports.generatePassword = async () => {
    var res = {};
    var randomstring = Math.random().toString(36).slice(-8);
    const hashPass = await bcrypt.hash(randomstring, 12);
    res['password']=randomstring;
    res['hashPassword']=hashPass;
    return res;
}

exports.verifyToken = (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send({
        message: "No token provided!"
      });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!"
        });
      }
      req.user = decoded;
      next();
    });
  };

  exports.getUsers = async (req, res, next) => {
    const columns = ['id','name','email','phone','id'];
    let limit = req.body.length;
    let start = req.body.start;
    let offset = start;
    let order = columns[req.body['order[0][column]']];
    let dir = req.body['order[0][dir]'];

    return new Promise((resolve, reject)=>{
        var where = {};
        where['role = ?'] = 'app_user';
        var conditions = buildConditions(req,where);
        var sql = "SELECT * FROM `users` WHERE "+conditions.where;
        sql+=" ORDER BY "+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
        dbConnection.execute(sql,conditions.values).then((row) => {
            row = JSON.parse(JSON.stringify(row));
            row[0].forEach(function(item,index){
              row[0][index]['image_original_path'] =  (item.image!='')?process.env.BASE_URL+'/uploads/user/'+item.image:process.env.BASE_URL+'/assets/profile/dummy-profile-image.jpg';
              row[0][index]['image_thumb_path'] = (item.image!='')?process.env.BASE_URL+'/uploads/user/thumb/'+item.image:process.env.BASE_URL+'/assets/profile/dummy-profile-image.jpg';
            });
            resolve(row[0]);
        }, (err) => {
            reject(err);
        })
    })
  }

  exports.getUsersCount = async (req, res, next) => {
    return new Promise((resolve, reject)=>{
      var where = {};
      where['role = ?'] = 'app_user';
      var conditions = buildConditions(req,where);
      var sql = "SELECT id FROM `users` WHERE "+conditions.where;
        dbConnection.execute(sql,conditions.values).then((row) => {
            resolve(row[0].length);
        }, (err) => {
            reject(err);
        })
    })
  }

  exports.getSerialNumber = (start,index) => {
    return parseInt(start)+parseInt((index+1));
  }

let buildConditions = (req,where) => {
  const whereNames = Object.keys(where);
  const whereValues = Object.values(where);
  var conditions = [];
  var values = [];
  var conditionsStr;
  whereNames.forEach((value,index)=>{
    conditions.push(value);
    values.push(whereValues[index]);
  });
  if (req.body.name !== '') {
    conditions.push("name LIKE ?");
    values.push("%" + req.body.name + "%");
  }

  if (req.body.email !== '') {
    conditions.push("email LIKE ?");
    values.push("%" + req.body.email + "%");
  }

  if (req.body.phone !== '') {
    conditions.push("phone LIKE ?");
    values.push("%" + req.body.phone + "%");
  }

  return {
    where: conditions.length ? conditions.join(' AND ') : '1',
    values: values
  };
}

  exports.buildConditionsString = (strObject) =>{
  const propertyNames = Object.keys(strObject);
  const propertyValues = Object.values(strObject);
  var conditions = [];
  var values = [];
  propertyNames.forEach((value,index)=>{
    conditions.push(value);
    values.push(propertyValues[index]);
  });
  return {
    where: conditions.length ? conditions.join(' AND ') : '1',
    values: values
  };
}

exports.buildUpdateConditionsString = (update, where) =>{
const updateNames = Object.keys(update);
const updateValues = Object.values(update);
const whereNames = Object.keys(where);
const whereValues = Object.values(where);
var updates = [];
var conditions = [];
var values = [];
updateNames.forEach((value,index)=>{
  updates.push(value);
  values.push(updateValues[index]);
});
whereNames.forEach((value,index)=>{
  conditions.push(value);
  values.push(whereValues[index]);
});
return {
  updates: updates.length ? updates.join(' , ') : '1',
  where: conditions.length ? conditions.join(' AND ') : '1',
  values: values
};
}

exports.buildDeleteConditionsString = (where) =>{
const whereNames = Object.keys(where);
const whereValues = Object.values(where);
var conditions = [];
var values = [];

whereNames.forEach((value,index)=>{
  conditions.push(value);
  values.push(whereValues[index]);
});
return {
  where: conditions.length ? conditions.join(' AND ') : '1',
  values: values
};
}

exports.buildInsertConditionsString = (insert) =>{
const insertNames = Object.keys(insert);
const insertValues = Object.values(insert);
var inserts = [];
var values = [];
var fields = [];
insertNames.forEach((value,index)=>{
  inserts.push(value);
  fields.push('?');
  values.push(insertValues[index]);
});
return {
  inserts: inserts.length ? inserts.join(',') : '1',
  fields: fields.length ? fields.join(',') : '1',
  values: values
};
}

exports.createQrCode = async (string) => {
  return new Promise((resolve, reject)=>{
    let stringdata = JSON.stringify(string);
    let opts = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1,
      margin: 4
    }
    QRCode.toDataURL(stringdata,opts, function (err, code) {
    if(err){
      console.log("error occurred QRCode");
      reject(err);
    }
    let base64Image = code.split(';base64,').pop();
    var file_name = Date.now()+'_'+string.id+'.png';
    fs.writeFile('public/uploads/equipment/qr_code/'+file_name, base64Image, {encoding: 'base64'}, function(err) {
    console.log('File created');
    });
    console.log(code);
    resolve(file_name);
    });
  });
}

exports.getTableFieldValue = async (table,field,where_field,where_value) => {
  return new Promise(async (resolve, reject)=>{
    await dbConnection.execute("SELECT "+field+" FROM "+table+" WHERE "+where_field+"=?", [where_value]).then((row) => {
      // console.log("+++++++++");
      // console.log(row[0][0][field]);
      // console.log(row[0].length);
      if(row[0].length > 0){
          resolve(row[0][0][field]);
      }
      else{
        reject("data does not exist.");
      }
  }, (err) => {
      reject(err);
  })
  })
}
