const express = require('express');
const apiRouter = express.Router();
const userRoutes = require('./userRoutes');
const exerciseRoutes = require('./exerciseRoutes');
const equipmentRoutes = require('./equipmentRoutes');
const workoutRoutes = require('./workoutRoutes');
const videoRoutes = require('./videoRoutes');

apiRouter.use('/', userRoutes);
apiRouter.use('/', exerciseRoutes);
apiRouter.use('/', equipmentRoutes);
apiRouter.use('/', videoRoutes);
apiRouter.use('/', workoutRoutes);
module.exports = apiRouter;