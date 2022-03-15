const {body} = require('express-validator');
const helper_general = require("../../helpers/general");
exports.upload_video = [
    helper_general.verifyToken,
    body("title", "The title must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim(),
    body("source_id", "Invalid id.")
    .notEmpty()
    .isInt({ min:1})
    .escape()
    .trim(),
    body("type", "Invalid type.")
    .notEmpty()
    .escape()
    .trim(),
    body("thumb_image").custom((value, { req })=>{
      let uploadedFile = req.files.thumb_image;
      if(uploadedFile.name !== ''){
        let fileExtension = uploadedFile.mimetype.split('/')[1];
          const allowedExtension = ["jpeg", "png", "jpg","gif"];
          if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
              throw new Error('Thumb image File format is not allowed, use only jpeg and png.');
          }
      }
      else{
        throw new Error('Upload Thumb image is required.');
      }
      return true;
  }),
  body("video").custom((value, { req })=>{
  let uploadedFile = req.files.video;
  if(uploadedFile.name !== ''){
      let fileExtension = uploadedFile.mimetype.split('/')[1];
      const allowedExtension = ["mp4"];
      if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
          throw new Error('Video File format is not allowed, use only mp4.');
      }
  }
  else{
      throw new Error('Upload Video is required.');
  }
  return true;
  }),
];

exports.delete_video = [
    helper_general.verifyToken,
    body("id", "Invalid id.")
    .notEmpty()
    .isInt({ min:1})
    .escape()
    .trim(),
];

exports.update_video = [
    helper_general.verifyToken,
    body("id", "Invalid id.")
    .notEmpty()
    .isInt({ min:1})
    .escape()
    .trim(),
    body("thumb_image").custom((value, { req })=>{

      if(req.files !== null && req.files.thumb_image!==undefined){
        let uploadedFile = req.files.thumb_image;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
          const allowedExtension = ["jpeg", "png", "jpg","gif"];
          if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
              throw new Error('Thumb image File format is not allowed, use only jpeg and png.');
          }
      }
      return true;
  }),
  body("video").custom((value, { req })=>{

      if(req.files !== null && req.files.video!==undefined){
          let uploadedFile = req.files.video;
          let fileExtension = uploadedFile.mimetype.split('/')[1];
          const allowedExtension = ["mp4"];
          if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
              throw new Error('Video File format is not allowed, use only mp4.');
          }
      }
      return true;
    }),
];

exports.get_equipment_related_videos = [
    helper_general.verifyToken,
    body("id", "Invalid id.")
    .notEmpty()
    .isInt({ min:1})
    .escape()
    .trim(),
];

exports.get_exercise_related_videos = [
    helper_general.verifyToken,
    body("id", "Invalid id.")
    .notEmpty()
    .isInt({ min:1})
    .escape()
    .trim(),
];

exports.delete_videos = [
    helper_general.verifyToken,
    body("id", "Invalid id.")
    .notEmpty()
    .isInt({ min:1})
    .escape()
    .trim(),
];