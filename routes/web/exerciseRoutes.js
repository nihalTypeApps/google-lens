const express = require('express');
const exerciseRoutes = express.Router();
const { body } = require("express-validator");
const helper_general = require("../../helpers/general");

const exerciseController = require("../../controllers/exerciseController");

const ifNotLoggedin = (req, res, next) => {
    if(!req.session.userID){
        return res.redirect('/login');
    }
    next();
}

const ifLoggedin = (req,res,next) => {
    if(req.session.userID){
        return res.redirect('/');
    }
    next();
}

exerciseRoutes.get("/add", ifNotLoggedin, exerciseController.addExercisePage);
exerciseRoutes.get("/manage", ifNotLoggedin, exerciseController.exerciseListingPage);
exerciseRoutes.post(
    "/get-exercises",
    exerciseController.getExercises
);
exerciseRoutes.post('/delete-exercise', [ifNotLoggedin,helper_general.verifyToken], exerciseController.deleteExercise);
exerciseRoutes.post('/upload-video', [ifNotLoggedin,helper_general.verifyToken,], exerciseController.exerciseUploadVideo);
exerciseRoutes.post(
    "/get-exercise-videos",
    exerciseController.getExerciseVideos
);
exerciseRoutes.post('/delete-video', ifNotLoggedin, exerciseController.deleteExerciseVideo);
exerciseRoutes.post('/update-video', ifNotLoggedin, exerciseController.updateExerciseVideo);
module.exports = exerciseRoutes;