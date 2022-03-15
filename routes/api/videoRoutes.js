const express = require('express');
const videoRoutes = express.Router();
const validation = require('../../validations/api/videoValidation');
const {validateRequest} = require('../../validations/validate');
const { body } = require("express-validator");
const helper_general = require("../../helpers/general");

const appVideoController = require("../../controllers/api/appVideoController");

videoRoutes.post("/upload-video",validation.upload_video,validateRequest,appVideoController.uploadVideo);
videoRoutes.post("/delete_video",validation.delete_video,validateRequest,appVideoController.deleteVideo);
videoRoutes.post("/update_video",validation.update_video,validateRequest,appVideoController.updateVideo);
videoRoutes.post("/get-equipment-related-videos",validation.get_equipment_related_videos,validateRequest,appVideoController.getEquipmentRelatedVideos);
videoRoutes.post("/get-exercise-related-videos",validation.get_exercise_related_videos,validateRequest,appVideoController.getExerciseRelatedVideos);
videoRoutes.post("/delete_videos",validation.delete_videos,validateRequest,appVideoController.deleteVideos);
module.exports = videoRoutes;