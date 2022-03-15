const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const async = require("async");
const dbConnection = require("../../utils/dbConnection");
const users = require('../../models/Users');
const helper_email = require("../../helpers/email");
const helper_general = require("../../helpers/general");
const helper_image = require("../../helpers/image");

exports.getOtherUserDetail = async (req, res, next) => {
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  try {
    if(error.length == 0){
      var user_id = req.body.user_id;
      await helper_general.getOtherUserDetail(user_id).then(row=>{
        response['status'] = '1';
        response['data']['user'] = row;
        if(req.xhr === true){
          res.render('users/user-edit', {
              user: row
          });
        }
        response['data']['message'] = "Data found";
      },
      err=>{
        if(req.xhr === true){
          res.render('users/user-edit', {
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

exports.user_register = async (req, res, next) => {
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  const user = await users.find({email:req.body.email});
  if (user.length >= 1) {
      error.push('This email already in use.');
  }
  try {
    if(error.length == 0){
      var insert = {};
      const hashPass = await bcrypt.hash(req.body.password, 12);
      insert['role'] = 'app_user';
      insert['name'] = req.body.name;
      insert['last_name'] = req.body.last_name;
      insert['email'] = req.body.email;
      if(req.body.iso2){
        insert['iso2'] = req.body.iso2;
        insert['dialCode'] = req.body.dialCode;
      }
      insert['phone'] = req.body.phone;
      insert['password'] = hashPass;
      const user = new users(insert);
      await user.save().then(res => {
        response['status'] = '1';
        response['data']['user_id'] = res._id;
        response['data']['message'] = "You have successfully registered.";
      }).catch(err => {
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

exports.user_login = async (req, res, next) => {
    var error = [];
    var response = {};
    var account;
    response['status'] = '0';
    response['data'] = {};
    var fields = {};
      fields['email = ?'] = req.body.email;
      await helper_general.emailExist(fields).then(result=>{
        if(!result){
            error.push('Email address does not exist.');
        }
      });

      await helper_general.getOtherUserDetailByEmail(req.body.email).then(async (user)=>{
        if(user){
          account = user;
          const checkPass = await bcrypt.compare(req.body.password, user.password);
          if (checkPass !== true) {
            error.push('Invalid Password.');
          }
        }
      }, err => {
        error.push(err);
      });
    try {
      if(error.length == 0){
        //const [row] = await dbConnection.execute('SELECT id,name,phone,email FROM `users` WHERE `email`=?', [req.body.email]);
        var token = jwt.sign({ id: account.id,email: account.email,phone: account.phone}, process.env.JWT_SECRET_KEY, {
          expiresIn: 86400 // 24 hours
        });
        helper_general.updateDeviceToken(account.id, req.body.device_type, req.body.device_token);
        response['status'] = '1';
        response['data']['user'] = account;
        response['data']['accessToken'] = token;
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

exports.user_forgot_password = async (req, res, next) => {
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  var fields = {};
    fields['email = ?'] = req.body.email;
    await helper_general.emailExist(fields).then(result=>{
      if(!result){
        error.push('This email does not exist in the system.');
      }
    });
  try {
    if(error.length == 0){
      var generatePass = await helper_general.generatePassword();
      await dbConnection.execute(
        "UPDATE users SET password = ? WHERE email = ?",
        [generatePass.hashPassword, req.body.email]
      );
      var params = {
        'password':generatePass.password
      };
      await helper_email.sendEmail(req.body.email, params, 4).then(result=>{
        response['status'] = '1';
        response['data']['email'] = result.data;
        response['data']['new_password'] = generatePass.password;
        response['data']['message'] = "Please check your inbox to get new password";
      },err=>{
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

exports.user_detail = (req, res) => {
  res.json(req.user);
}

exports.updateUser = async (req, res, next) => {
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  var fields = {};
    fields['email = ?'] = req.body.email;
    fields['id != ?'] = req.body.user_id;
    await helper_general.emailExist(fields).then(result=>{
      if(result){
        error.push('This email already in use.');
      }
    });
  try {
    if(error.length == 0){
      var where = {};
      var update = {};
      where['id = ?'] = req.body.user_id;
      update['name = ?'] = req.body.name;
      update['email = ?'] = req.body.email;
      update['phone = ?'] = req.body.phone;
      if(req.body.password !== ''){
        update['password = ?'] = await bcrypt.hash(req.body.password, 12);;
      }
      var conditions = helper_general.buildUpdateConditionsString(update, where);
      var sql = "UPDATE `users` SET "+conditions.updates+" WHERE "+conditions.where;
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

exports.deleteUser = async (req, res, next) => {
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
      where['id = ?'] = req.body.user_id;
      var conditions = helper_general.buildDeleteConditionsString(where);
      var sql = "DELETE FROM `users` WHERE "+conditions.where;
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

exports.editUserProfile = async (req, res, next) => {
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  var image_name = '';
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    var fields = {};
    fields['email = ?'] = req.body.email;
    fields['id != ?'] = req.user.id;
    await helper_general.emailExist(fields).then(result=>{
      if(result){
        error.push('This email already in use.');
      }
    });

    await helper_general.getOtherUserDetail(req.user.id).then(async (row)=>{
      let image_dir = `public/uploads/user`;
      let thumb_image_dir = `public/uploads/user/thumb`;
      if(req.body.image_type_format === 'base64'){
        if(req.body.image && req.body.image!==undefined){
            let image_info = helper_image.getBase64ImageInfo(req.body.image);
            let fileExtension = image_info.extention;
            image_name = Date.now()+'-'+row.name.replace(/\s+/g, "-")+'_'+row.id+'.' + fileExtension;
            await helper_image.createDirectories([image_dir,thumb_image_dir]).then(async (res)=>{
              helper_image.uploadBase64Image(image_info.image_string, image_dir, image_name);
              helper_image.resize(image_dir+`/${image_name}`,thumb_image_dir+`/${image_name}`,300,300);
              if(row.image!==''){
                helper_image.removeImage(image_dir+`/${row.image}`);
                helper_image.removeImage(thumb_image_dir+`/${row.image}`);
              }
            });
        }
      }
      else{
        if(req.files !== null && req.files.image!==undefined){
          let uploadedFile = req.files.image;
          let fileExtension = uploadedFile.mimetype.split('/')[1];
          image_name = Date.now()+'-'+row.name.replace(/\s+/g, "-")+'_'+row.id+'.' + fileExtension;

          await helper_image.createDirectories([image_dir,thumb_image_dir]).then(async (res)=>{
            await uploadedFile.mv(image_dir+`/${image_name}`, (err ) => {
              if (err) {
                error.push(err);
              }
            });
            await helper_image.resizeLargeFile(image_dir+`/${image_name}`,thumb_image_dir+`/${image_name}`,300,300);
            if(row.image!==''){
              helper_image.removeImage(image_dir+`/${row.image}`);
              helper_image.removeImage(thumb_image_dir+`/${row.image}`);
            }
          });
        }
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
      where['id = ?'] = req.user.id;
      update['name = ?'] = req.body.name;
      update['last_name = ?'] = req.body.last_name;
      update['email = ?'] = req.body.email;
      if(req.body.iso2){
        update['iso2 = ?'] = req.body.iso2;
        update['dialCode = ?'] = req.body.dialCode;
      }
      update['phone = ?'] = req.body.phone;
      if(image_name!==''){
        update['image = ?'] = image_name;
      }
      if(req.body.password !== ''){
        update['password = ?'] = await bcrypt.hash(req.body.password, 12);;
      }
      var conditions = helper_general.buildUpdateConditionsString(update, where);
      var sql = "UPDATE `users` SET "+conditions.updates+" WHERE "+conditions.where;
      await dbConnection.execute(sql,conditions.values).then((row) => {
        //ResultSetHeader
        response['status'] = '1';
        response['data']['message'] = "Updated successfully.";
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
exports.getBookmarks = async (req, res, next) => {
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};

  try {
    if(error.length == 0){
      let limit = req.body.length;
      let offset = parseInt((++req.body.start*req.body.length)-req.body.length);;
      let order = 'b.id';
      let dir = 'desc';
      var where = {};
        where['b.user_id = ?'] = req.user.id;
        if(req.body.title!==undefined){
          //where['ex.title LIKE ?'] = "%" + req.body.title + "%";
        }
        var conditions = helper_general.buildConditionsString(where);
        var sql = "SELECT b.id as bookmark_id,b.type,";
        sql += "(CASE b.type WHEN 'equipment' THEN eq.id ELSE ex.id END) as id, (CASE b.type WHEN 'equipment' THEN eq.title ELSE ex.title END) as title, (CASE b.type WHEN 'equipment' THEN eq.description ELSE ex.description END) as description, (CASE b.type WHEN 'equipment' THEN eq.image ELSE ex.image END) as image";
        sql += " FROM `bookmarks` as b"
        sql += " LEFT JOIN `exercises` as ex ON (b.source_id = ex.id)";
        sql += " LEFT JOIN `equipments` as eq ON (b.source_id = eq.id)";
        sql += " WHERE "+conditions.where;
        sql +=" ORDER BY "+order+" "+dir+" LIMIT "+limit+" OFFSET "+offset;
        await dbConnection.execute(sql,conditions.values).then(async (row) => {
          row = JSON.parse(JSON.stringify(row));
          if(row[0].length > 0){
            let tasks = [];
            await row[0].forEach(async function(item,index){
              var image_dir = '';
              switch(item.type){
                case 'equipment':{
                  image_dir = 'equipment';
                }break;
                case 'exercise':{
                  image_dir = 'exercise';
                }break;
                default:{

                }
              }
              row[0][index]['image_original_path'] = process.env.BASE_URL+'/uploads/'+image_dir+'/'+item.image;
              row[0][index]['image_thumb_path'] = process.env.BASE_URL+'/uploads/'+image_dir+'/thumb/'+item.image;
            });
            
            response['status'] = '1';
            response['data']['bookmarks'] = row[0];
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

exports.getUsersCount = async (req, res, next) => {
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  try{
    var where = {};
    let filters = req.body;
    filters = JSON.stringify(filters);
    filters = JSON.parse(filters);
    for(var key in filters) {
      where['u.'+key+' = ?'] = filters[key];
    }
    var conditions = helper_general.buildConditionsString(where);
    var sql = "SELECT count(u.id) as count";
    sql += " FROM `users` as u";
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
