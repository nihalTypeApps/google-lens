const express = require('express');
const userRoutes = express.Router();
const { body } = require("express-validator");
const helper_general = require("../../helpers/general");

const userController = require("../../controllers/userController");

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

userRoutes.get('/', ifNotLoggedin, userController.homePage);
userRoutes.post(
    "/signup",
    ifLoggedin,
    [
        body("_name", "The name must be of minimum 3 characters length")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_phone", "Invalid phone number")
            .notEmpty()
            .escape()
            .trim()
            .isNumeric(),
        body("_password", "The Password must be of minimum 4 characters length")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    userController.register
);
userRoutes.get("/signup", ifLoggedin, userController.registerPage);
userRoutes.get("/login", ifLoggedin, userController.loginPage);
userRoutes.post("/login",
ifLoggedin,
    [
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
        body("_password", "The Password must be of minimum 4 characters length")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    userController.login
);
userRoutes.get('/profile', ifNotLoggedin, userController.profilePage);
userRoutes.post(
    "/profile",
    ifNotLoggedin,
    [
        body("_name", "The name must be of minimum 3 characters length")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("_phone", "Invalid phone number")
            .notEmpty()
            .escape()
            .trim()
            .isNumeric(),
        body("_password").custom((value, { req })=>{
          if(req.body._password !== ''){
            if(req.body._password.length < 4){
                throw new Error('The Password must be of minimum 4 characters length.');
            }
          }
            return true;
        }),
        body("_password_confirmation").custom((value, { req }) => {
            if (value !== req.body._password) {
              throw new Error('Password confirmation does not match password');
            }
            // Indicates the success of this synchronous custom validator
            return true;
          }),
    ],
    userController.profile
);
userRoutes.get('/forgot-password',userController.forgotPasswordPage);
userRoutes.post(
    "/forgot-password",
    [
        body("_email", "Invalid email address")
            .notEmpty()
            .escape()
            .trim()
            .isEmail(),
    ],
    userController.forgotPassword
);
userRoutes.get("/users/manage", ifNotLoggedin, userController.userListingPage);

userRoutes.post(
    "/users/get-app-users",
    userController.getAppUsers
);
userRoutes.post('/users/delete-user', ifNotLoggedin, userController.deleteUser);
module.exports = userRoutes;