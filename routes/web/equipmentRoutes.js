const express = require('express');
const equipmentRoutes = express.Router();
const { body } = require("express-validator");
const helper_general = require("../../helpers/general");

const equipmentController = require("../../controllers/equipmentController");

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

equipmentRoutes.get("/add", ifNotLoggedin, equipmentController.addEquipmentPage);
equipmentRoutes.get("/manage", ifNotLoggedin, equipmentController.equipmentListingPage);
equipmentRoutes.post(
    "/get-equipments",
    equipmentController.getEquipments
);
equipmentRoutes.post('/delete-equipment', [ifNotLoggedin,helper_general.verifyToken], equipmentController.deleteEquipment);
equipmentRoutes.post('/assign-exercise', [ifNotLoggedin,helper_general.verifyToken], equipmentController.assignExercise);
equipmentRoutes.post(
    "/get-exercises-for-assignment",
    equipmentController.getExercisesForAssignment
);
equipmentRoutes.post(
    "/process-exercises-assignment",
    equipmentController.processExercisesAssignment
);
equipmentRoutes.post('/upload-video', [ifNotLoggedin,helper_general.verifyToken], equipmentController.equipmentUploadVideo);
equipmentRoutes.post(
    "/get-equipment-videos",
    equipmentController.getEquipmentVideos
);
equipmentRoutes.post('/delete-video', ifNotLoggedin, equipmentController.deleteEquipmentVideo);
equipmentRoutes.post('/update-video', ifNotLoggedin, equipmentController.updateEquipmentVideo);
module.exports = equipmentRoutes;