const {body} = require('express-validator');
const helper_general = require("../../helpers/general");
const helper_image = require("../../helpers/image");
exports.add_workout = [
    helper_general.verifyToken,
    body("title")
        .notEmpty()
        .withMessage("Title is required")
        .escape()
        .trim(),
    body("warmup_time")
        .notEmpty()
        .isInt({min:1})
        .withMessage("Warmup time is required")
        .escape()
        .trim(),    
    body("schedule_time", "Invalid schedule time")
        .notEmpty()
        .escape()
        .trim(),
    body("schedule_date", "Invalid schedule date")
        .notEmpty()
        .escape()
        .trim(),
    body("description")
        .notEmpty()
        .withMessage("Description is required")
        .escape()
        .trim()
        .isLength({ min: 10 })
        .withMessage("Description's minimum length should be of 10 characters"),
    body("image").custom((value, { req })=>{
    if(req.body.image_type_format !== 'base64'){
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
    }
    else{
        if(req.body.image !== ''){
            let imageInfo = helper_image.getBase64ImageInfo(req.body.image);
            const allowedExtension = ["jpeg", "png", "jpg","gif"];
            if(allowedExtension.indexOf(imageInfo.extention.toLowerCase()) < 0){
                throw new Error('File format is not allowed, use only jpeg and png.');
            }
        }
        else{
            throw new Error('Upload image is required.');
        }
    }
    return true;
    }),
];

exports.add_exercise_into_workout = [
    helper_general.verifyToken,
    body("workout_id")
        .notEmpty()
        .isInt({ min:1})
        .withMessage("Workout id is required"),
    body("exercise_id")
        .notEmpty()
        .isInt({ min:1})
        .withMessage("Exercise id is required")
        .custom(async (value, {req})=>{
            if(req.body.exercise_id !== 0 && req.body.workout_id !== 0){
                var fields = {};
                fields['exercise_id = ?'] = req.body.exercise_id;
                fields['workout_id = ?'] = req.body.workout_id;
                await helper_general.workoutExerciseExist(fields).then(result=>{
                    if(result){
                        throw new Error('Already exist.');
                    }
                });
            }
            return true;
        }),
];

exports.remove_exercise_from_workout = [
    helper_general.verifyToken,
    body("id")
        .notEmpty()
        .isInt({ min:1})
        .withMessage("Id is required"),
];

exports.reorder_workout_exercise = [
    helper_general.verifyToken,
    body("ids")
        .custom((value, {req})=>{
        if(!Array.isArray(req.body.ids)){
            throw new Error('Provide array of ids.');
        }
        if(Array.isArray(req.body.ids) && req.body.ids.length == 0){
            throw new Error('Do not send blank array of ids.');
        }
        return true;
    }),
];

exports.workout_exercise_rest_time = [
    helper_general.verifyToken,
    body("id")
        .notEmpty()
        .isInt({ min:1})
        .withMessage("Id is required"),
    body("action")
        .notEmpty()
        .withMessage("Action is required")
        .custom((value, {req})=>{
        const allowedAction = ["add", "remove"];
        if(allowedAction.indexOf(req.body.action.toLowerCase()) < 0){
        throw new Error('Only add and remove actions are allowed.');
        }
        return true;
        }),
];

exports.get_workout_exercise_list = [
    helper_general.verifyToken,
    body("id")
        .notEmpty()
        .isInt({ min:1})
        .withMessage("Id is required"),
];

exports.get_workouts = [
    helper_general.verifyToken,
];

exports.update_workout_exercise_duration = [
    helper_general.verifyToken,
];

exports.get_workout_detail = [
    helper_general.verifyToken,
    body("id", "Invalid exercise id.")
        .notEmpty()
        .isInt({ min:1})
        .escape()
        .trim(),
];

exports.finish_workout = [
    helper_general.verifyToken,
    body("id", "Invalid workout id.")
        .notEmpty()
        .isInt({ min:1})
        .escape()
        .trim(),
];

exports.archive_workout = [
    helper_general.verifyToken,
    body("id", "Invalid workout id.")
        .notEmpty()
        .escape()
        .trim(),
    body("action")
    .notEmpty()
    .withMessage("Action is required")
    .custom((value, {req})=>{
        const allowedAction = ["add","restore"];
        if(allowedAction.indexOf(req.body.action.toLowerCase()) < 0){
            throw new Error('Only add and remove actions are allowed.');
        }
        return true;
    }),
];

exports.delete_workout = [
    helper_general.verifyToken,
    body("id", "Invalid id.")
        .notEmpty()
        .isInt({ min:1})
        .escape()
        .trim(),
];

exports.add_bulk_exercise_into_workout = [
    helper_general.verifyToken,
    body("workout_id")
        .notEmpty()
        .isInt({ min:1})
        .withMessage("Workout id is required."),
    body("exercises")
        .notEmpty()
        .withMessage("No exercises are found to add into the workout."),
];

exports.get_unselected_exercises = [
    helper_general.verifyToken,
];

exports.update_workout = [
    helper_general.verifyToken,
    body("id")
        .notEmpty()
        .isInt({ min:1})
        .withMessage("Workout Id is required")
        .escape()
        .trim(),
    body("warmup_time")
        .notEmpty()
        .isInt({min:1})
        .withMessage("Warmup time is required")
        .escape()
        .trim(), 
    body("title")
        .notEmpty()
        .withMessage("Title is required")
        .escape()
        .trim(),
    body("schedule_time", "Invalid schedule time")
        .notEmpty()
        .escape()
        .trim(),
    body("schedule_date", "Invalid schedule date")
        .notEmpty()
        .escape()
        .trim(),
    body("description")
        .notEmpty()
        .withMessage("Description is required")
        .escape()
        .trim()
        .isLength({ min: 10 })
        .withMessage("Description's minimum length should be of 10 characters"),
    body("image").custom((value, { req })=>{
      if(req.body.image_type_format !== 'base64'){
          let uploadedFile = req.files.image;
          if(uploadedFile.name !== ''){
              let fileExtension = uploadedFile.mimetype.split('/')[1];
              const allowedExtension = ["jpeg", "png", "jpg","gif"];
              if(allowedExtension.indexOf(fileExtension.toLowerCase()) < 0){
                  throw new Error('File format is not allowed, use only jpeg and png.');
              }
          }
      }
      else{
          if(req.body.image !== ''){
              let imageInfo = helper_image.getBase64ImageInfo(req.body.image);
              const allowedExtension = ["jpeg", "png", "jpg","gif"];
              if(allowedExtension.indexOf(imageInfo.extention.toLowerCase()) < 0){
                  throw new Error('File format is not allowed, use only jpeg and png.');
              }
          }
      }
      return true;
    }),
];

exports.get_workout_exercise_detail = [
    helper_general.verifyToken,
    body("id", "Invalid id.")
        .notEmpty()
        .isInt({ min:1})
        .escape()
        .trim(),
];

exports.update_workout_exercise_detail = [
    helper_general.verifyToken,
    body("workout_exercise_id")
        .notEmpty()
        .isInt({ min:1})
        .withMessage("Id is required")
        .escape()
        .trim(),
    body("workout_exercise_reps", "Invalid reps")
        .notEmpty()
        .escape()
        .isNumeric()
        .trim(),
    body("workout_exercise_sets", "Invalid sets")
        .notEmpty()
        .escape()
        .isNumeric()
        .trim(),
    body("workout_exercise_actual_duration", "Invalid duration")
        .notEmpty()
        .escape()
        .trim(),
];

exports.get_workouts_count = [
    helper_general.verifyToken,
];
