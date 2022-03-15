const express = require('express');
const exerciseRoutes = express.Router();
const validation = require('../../validations/api/exerciseValidation');
const {validateRequest} = require('../../validations/validate');
const appExerciseController = require("../../controllers/api/appExerciseController");

exerciseRoutes.post("/add_exercise",validation.add_exercise,validateRequest,appExerciseController.add_exercise);
exerciseRoutes.post("/get-exercise-detail",validation.get_exercise_detail,validateRequest,appExerciseController.getExerciseDetail);
exerciseRoutes.post("/update_exercise",validation.update_exercise,validateRequest,appExerciseController.updateExercise);
exerciseRoutes.post("/delete_exercise",validation.delete_exercise,validateRequest,appExerciseController.deleteExercise);
exerciseRoutes.post("/get-exercise-listing",validation.get_exercise_listing,validateRequest,appExerciseController.getExerciseListing);
exerciseRoutes.post("/bookmark_exercise",validation.bookmark_exercise,validateRequest,appExerciseController.bookmarkExercise);
exerciseRoutes.post("/get_bookmark_exercises",validation.get_bookmark_exercises,validateRequest,appExerciseController.getBookmarkExercises);
exerciseRoutes.post("/get_exercises_count",validation.get_exercises_count,validateRequest,appExerciseController.getExercisesCount);
module.exports = exerciseRoutes;