const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const dbConnection = require("../../utils/dbConnection");
const helper_email = require("../../helpers/email");
const helper_general = require("../../helpers/general");
const helper_image = require("../../helpers/image");

exports.getOtherUserDetail = async (req, res, next) => {
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
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    const [row] = await dbConnection.execute('SELECT * FROM `users` WHERE `email`=?', [req.body.email]);
    if (row.length >= 1) {
        error.push('This email already in use.');
    }
  }
  try {
    if(error.length == 0){
      const hashPass = await bcrypt.hash(req.body.password, 12);
      var insert = {};
      insert['role'] = 'app_user';
      insert['name'] = req.body.name;
      insert['email'] = req.body.email;
      insert['iso2'] = req.body.iso2;
      insert['dialCode'] = req.body.dialCode;
      insert['phone'] = req.body.phone;
      insert['password'] = hashPass;
      var conditions = helper_general.buildInsertConditionsString(insert);
      var sql = "INSERT INTO `users`("+conditions.inserts+") VALUES("+conditions.fields+")";
      await dbConnection.execute(sql,conditions.values).then(async (row) => {
        var params = {'user_name':req.body.name,'email':req.body.email,'password':req.body.password};
        await helper_email.sendEmail(req.body.email, params, 11).then((result)=>{
          response['status'] = '1';
          response['data']['email'] = result.data;
          response['data']['message'] = "You have successfully registered.";
        },(err) =>{
          response['data']['error'] = err;
        });
      },(err) => {
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

exports.user_login = async (req, res, next) => {
    const errors = validationResult(req);
    var error = [];
    var response = {};
    var account;
    response['status'] = '0';
    response['data'] = {};
    if (!errors.isEmpty()) {
      error.push(errors.array()[0].msg);
    }
    else{
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
    }
    try {
      if(error.length == 0){
        //const [row] = await dbConnection.execute('SELECT id,name,phone,email FROM `users` WHERE `email`=?', [req.body.email]);
        var token = jwt.sign({ id: account.id,email: account.email,phone: account.phone}, process.env.JWT_SECRET_KEY, {
          expiresIn: 86400 // 24 hours
        });
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
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    var fields = {};
    fields['email = ?'] = req.body.email;
    await helper_general.emailExist(fields).then(result=>{
      if(!result){
        error.push('This email does not exist in the system.');
      }
    });
  }
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
      await helper_email.sendEmail(req.body.email, params, 10).then(result=>{
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
  const errors = validationResult(req);
  var error = [];
  var response = {};
  response['status'] = '0';
  response['data'] = {};
  if (!errors.isEmpty()) {
    error.push(errors.array()[0].msg);
  }
  else{
    var fields = {};
    fields['email = ?'] = req.body.email;
    fields['id != ?'] = req.body.user_id;
    await helper_general.emailExist(fields).then(result=>{
      if(result){
        error.push('This email already in use.');
      }
    });
  }
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
      if(req.files !== null && req.files.image!==undefined){
        let uploadedFile = req.files.image;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = Date.now()+'-'+row.name.replace(/\s+/g, "-")+'_'+row.id+'.' + fileExtension;
        let image_dir = `public/uploads/user`;
        let thumb_image_dir = `public/uploads/user/thumb`;

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
      update['email = ?'] = req.body.email;
      update['iso2 = ?'] = req.body.iso2;
      update['dialCode = ?'] = req.body.dialCode;
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
