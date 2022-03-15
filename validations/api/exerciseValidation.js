const {body} = require('express-validator');
const helper_general = require("../../helpers/general");
exports.add_exercise = [
    helper_general.verifyToken,
    body("title", "The title must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim(),
    body("reps", "Invalid reps")
        .notEmpty()
        .escape()
        .trim(),
    body("sets", "Invalid sets")
        .notEmpty()
        .escape()
        .trim()
        .isNumeric(),
    body("duration", "Invalid duration")
        .notEmpty()
        .escape()
        .trim(),
    body("description", "Invalid description")
        .notEmpty()
        .escape()
        .trim()
        .isLength({ min: 10 }),
    body("image").custom((value, { req })=>{
        let uploadedFile = req.files.image;
        if(uploadedFile.name !== ''){
          let fileExtension = uploadedFile.mimetype.split('/')[1];
          const allowedExtension = ["jpeg", "png", "jpg","gif"];
          if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
              throw new Error('File format is not allowed, use only jpeg and png.');
          }
        }
        else{
          throw new Error('Upload image is required.');
        }
        return true;
    }),
];

exports.get_exercise_detail = [
    helper_general.verifyToken,
    body("id", "Invalid exercise id.")
        .notEmpty()
        .escape()
        .trim(),
];

exports.update_exercise = [
    helper_general.verifyToken,
    body("title", "The title must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim(),
    body("reps", "Invalid reps")
        .notEmpty()
        .escape()
        .trim(),
    body("sets", "Invalid sets")
        .notEmpty()
        .escape()
        .trim()
        .isNumeric(),
    body("duration", "Invalid duration")
        .notEmpty()
        .escape()
        .trim(),
    body("description", "Invalid description")
        .notEmpty()
        .escape()
        .trim()
        .isLength({ min: 10 }),
    body("image").custom((value, { req })=>{
        if(req.files!==null){
          let uploadedFile = req.files.image;
          let fileExtension = uploadedFile.mimetype.split('/')[1];
          const allowedExtension = ["jpeg", "png", "jpg","gif","gif"];
          if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
              throw new Error('File format is not allowed, use only jpeg and png.');
          }
        }
        return true;
    }),
];

exports.delete_exercise = [
    helper_general.verifyToken,
    body("id", "Invalid id.")
    .notEmpty()
    .isInt({ min:1})
    .escape()
    .trim(),
];

exports.get_exercise_listing = [
    helper_general.verifyToken
];

exports.bookmark_exercise = [
    helper_general.verifyToken,
    body("id")
    .notEmpty()
    .withMessage("Exercise id is required"),
    body("action")
    .notEmpty()
    .withMessage("Action is required")
    .custom(async (value, {req})=>{
      const allowedAction = ["add", "remove"];
      if(allowedAction.indexOf(req.body.action.toLowerCase()) < 0){
          throw new Error('Only add and remove actions are allowed.');
      }
      if(req.body.id !== 0 && req.body.action === 'add'){
          var fields = {};
          fields['source_id = ?'] = req.body.id;
          fields['user_id = ?'] = req.user.id;
          await helper_general.bookmarkExist(fields).then(result=>{
              if(result){
                  throw new Error('Already exist.');
              }
          });
      }
      return true;
  }),
];

exports.get_bookmark_exercises = [
    helper_general.verifyToken,
];

exports.get_exercises_count = [
    helper_general.verifyToken,
];