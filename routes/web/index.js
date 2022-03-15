const express = require('express');
const webRouter = express.Router();
const userRoutes = require('./userRoutes');
const exerciseRoutes = require('./exerciseRoutes');
const equipmentRoutes = require('./equipmentRoutes');

webRouter.use('/', userRoutes);
webRouter.use('/exercise', exerciseRoutes);
webRouter.use('/equipment', equipmentRoutes);
webRouter.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        next(err);
    });
    res.redirect('/login');
});
module.exports = webRouter;