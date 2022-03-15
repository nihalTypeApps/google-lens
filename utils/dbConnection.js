var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shoping_cart', {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
module.exports = db;
