const {body} = require('express-validator');
const helper_general = require("../../helpers/general");
exports.login = [
    body("email", "Invalid email address.")
        .notEmpty()
        .escape()
        .trim()
        .isEmail(),
    body("password", "The Password must be of minimum 4 characters length.")
        .notEmpty()
        .trim()
        .isLength({ min: 4 }),
];

exports.register = [
    body("name", "The first name must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim()
        .isLength({ min: 3 }),
    body("last_name", "The last name must be of minimum 2 characters length")
        .escape()
        .trim()
        .isLength({ min: 2 }),
    body("email", "Invalid email address.")
        .notEmpty()
        .escape()
        .trim()
        .isEmail(),
    body("phone", "Invalid phone number")
        .notEmpty()
        .escape()
        .trim()
        .isNumeric(),
    body("password", "The Password must be of minimum 4 characters length.")
        .notEmpty()
        .trim()
        .isLength({ min: 4 }),
];

exports.forgot_password = [
    body("email", "Invalid email address")
        .notEmpty()
        .escape()
        .trim()
        .isEmail(),
];

exports.user_detail = [
    helper_general.verifyToken
];

exports.get_other_user_detail = [
    helper_general.verifyToken
];

exports.update_user = [
    helper_general.verifyToken,
    body("name", "The name must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim()
        .isLength({ min: 3 }),
    body("email", "Invalid email address.")
        .notEmpty()
        .escape()
        .trim()
        .isEmail(),
    body("phone", "Invalid phone number")
        .notEmpty()
        .escape()
        .trim()
        .isNumeric(),
    body("password").custom((value, { req })=>{
        if(req.body.password !== ''){
            if(req.body.password.length < 4){
            throw new Error('The Password must be of minimum 4 characters length.');
            }
        }
        return true;
    }),
];

exports.delete_user = [
    helper_general.verifyToken,
    body("user_id", "Invalid user id.")
        .isInt({ min:1})
        .notEmpty()
        .escape()
        .trim(),
];

exports.edit_profile = [
    helper_general.verifyToken,
    body("name", "The first name must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim()
        .isLength({ min: 3 }),
    body("last_name", "The last name must be of minimum 2 characters length")
        .escape()
        .trim()
        .isLength({ min: 2 }),    
    body("email", "Invalid email address.")
        .notEmpty()
        .escape()
        .trim()
        .isEmail(),
    body("phone", "Invalid phone number")
        .notEmpty()
        .escape()
        .trim()
        .isNumeric(),
    body("password").custom((value, { req })=>{
        if(req.body.password !== ''){
          if(req.body.password.length < 4){
              throw new Error('The Password must be of minimum 4 characters length.');
          }
        }
        return true;
    }),
    // body("image").custom((value, { req })=>{
    //     if(req.body.image_type_format !== 'base64'){
    //         let uploadedFile = req.files.image;
    //         if(uploadedFile.name !== ''){
    //             let fileExtension = uploadedFile.mimetype.split('/')[1];
    //             const allowedExtension = ["jpeg", "png", "jpg","gif"];
    //             if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
    //                 throw new Error('File format is not allowed, use only jpeg and png.');
    //             }
    //         }
    //         else{
    //             throw new Error('Upload image is required.');
    //         }
    //     }
    //     else{
    //         if(req.body.image !== ''){
    //             let imageInfo = helper_image.getBase64ImageInfo(req.body.image);
    //             const allowedExtension = ["jpeg", "png", "jpg","gif"];
    //             if(allowedExtension.indexOf(imageInfo.extention.toLowerCase()) < 0){
    //                 throw new Error('File format is not allowed, use only jpeg and png.');
    //             }
    //         }
    //         else{
    //             throw new Error('Upload image is required.');
    //         }
    //     }
    //     return true;
    //     }),
];

exports.get_bookmarks = [
    helper_general.verifyToken
];

exports.get_users_count = [
    helper_general.verifyToken,
];