const express = require('express');
const userRoutes = express.Router();
const validation = require('../../validations/api/userValidation');
const {validateRequest} = require('../../validations/validate');
const appUserController = require("../../controllers/api/appUserController");

userRoutes.post("/login",validation.login,validateRequest,appUserController.user_login);
userRoutes.post("/register",validation.register,validateRequest,appUserController.user_register);
userRoutes.post("/forgot-password",validation.forgot_password,validateRequest,appUserController.user_forgot_password);
userRoutes.get("/user-detail",validation.user_detail,validateRequest,appUserController.user_detail);
userRoutes.post("/get-other-user-detail",validation.get_other_user_detail,validateRequest,appUserController.getOtherUserDetail);
userRoutes.post("/update_user",validation.update_user,validateRequest,appUserController.updateUser);
userRoutes.post("/delete_user",validation.delete_user,validateRequest,appUserController.deleteUser);
userRoutes.post("/edit_profile",validation.edit_profile,validateRequest,appUserController.editUserProfile);
userRoutes.post("/get_bookmarks",validation.get_bookmarks,validateRequest,appUserController.getBookmarks);
userRoutes.post("/get_users_count",validation.get_users_count,validateRequest,appUserController.getUsersCount);
module.exports = userRoutes;