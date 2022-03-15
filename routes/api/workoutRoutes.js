const express = require('express');
const workoutRoutes = express.Router();
const validation = require('../../validations/api/workoutValidation');
const {validateRequest} = require('../../validations/validate');

const appWorkoutController = require("../../controllers/api/appWorkoutController");

workoutRoutes.post("/add_workout",validation.add_workout,validateRequest,appWorkoutController.addWorkout);
workoutRoutes.post("/add_exercise_into_workout",validation.add_exercise_into_workout,validateRequest,appWorkoutController.addExerciseIntoWorkout);
workoutRoutes.post("/remove_exercise_from_workout",validation.remove_exercise_from_workout,validateRequest,appWorkoutController.removeExerciseFromWorkout);
workoutRoutes.post("/reorder_workout_exercise",validation.reorder_workout_exercise,validateRequest,appWorkoutController.reorderWorkoutExercise);
workoutRoutes.post("/workout_exercise_rest_time",validation.workout_exercise_rest_time,validateRequest,appWorkoutController.workoutExerciseRestTime);
workoutRoutes.post("/get_workout_exercise_list",validation.get_workout_exercise_list,validateRequest,appWorkoutController.getWorkoutExerciseList);
workoutRoutes.post("/get_workouts",validation.get_workouts,validateRequest,appWorkoutController.getWorkouts);
workoutRoutes.post("/update_workout_exercise_duration",validation.update_workout_exercise_duration,validateRequest,appWorkoutController.updateWorkoutExerciseDuration);
workoutRoutes.post("/get_workout_detail",validation.get_workout_detail,validateRequest,appWorkoutController.getWorkoutDetail);
workoutRoutes.post("/finish_workout",validation.finish_workout,validateRequest,appWorkoutController.finishWorkout);
workoutRoutes.post("/archive_workout",validation.archive_workout,validateRequest,appWorkoutController.archiveWorkout);
workoutRoutes.post("/delete_workout",validation.delete_workout,validateRequest,appWorkoutController.deleteWorkout);
workoutRoutes.post("/add_bulk_exercise_into_workout",validation.add_bulk_exercise_into_workout,validateRequest,appWorkoutController.addBulkExerciseIntoWorkout);
workoutRoutes.post("/get_unselected_exercises",validation.get_unselected_exercises,validateRequest,appWorkoutController.getUnselectedExercises);
workoutRoutes.post("/update_workout",validation.update_workout,validateRequest,appWorkoutController.updateWorkout);
workoutRoutes.post("/get_workout_exercise_detail",validation.get_workout_exercise_detail,validateRequest,appWorkoutController.getWorkoutExerciseDetail);
workoutRoutes.post("/update_workout_exercise_detail",validation.update_workout_exercise_detail,validateRequest,appWorkoutController.updateWorkoutExerciseDetail);
workoutRoutes.post("/get_workouts_count",validation.get_workouts_count,validateRequest,appWorkoutController.getWorkoutsCount);
module.exports = workoutRoutes;