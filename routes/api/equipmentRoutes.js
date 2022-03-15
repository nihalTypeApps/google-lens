const express = require('express');
const equipmentRoutes = express.Router();
const validation = require('../../validations/api/equipmentValidation');
const {validateRequest} = require('../../validations/validate');
const appEquipmentController = require("../../controllers/api/appEquipmentController");

equipmentRoutes.post("/add_equipment",validation.add_equipment,validateRequest,appEquipmentController.add_equipment);
equipmentRoutes.post("/get-equipment-detail",validation.get_equipment_detail,validateRequest,appEquipmentController.getEquipmentDetail);
equipmentRoutes.post("/update_equipment",validation.get_equipment_detail,validateRequest,appEquipmentController.updateEquipment);
equipmentRoutes.post("/delete_equipment",validation.delete_equipment,validateRequest,appEquipmentController.deleteEquipment);
equipmentRoutes.post("/get-equipment-listing",validation.get_equipment_listing,validateRequest,appEquipmentController.getEquipmentListing);
equipmentRoutes.post("/get-equipment-related-exercises",validation.get_equipment_related_exercises,validateRequest,appEquipmentController.getEquipmentRelatedExercises);
equipmentRoutes.post("/bookmark_equipment",validation.bookmark_equipment,validateRequest,appEquipmentController.bookmarkEquipment);
equipmentRoutes.post("/get_bookmark_equipments",validation.get_bookmark_equipments,validateRequest,appEquipmentController.getBookmarkEquipments);
equipmentRoutes.post("/get_equipments_count",validation.get_equipments_count,validateRequest,appEquipmentController.getEquipmentsCount);
module.exports = equipmentRoutes;