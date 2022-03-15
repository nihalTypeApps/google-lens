const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const UsersSchema = new Schema({
    role: {
        type: String,
        enum: ['admin', 'app_user',]
    },
    image: String,
    name: String,
    last_name: String,
    email: String,
    password: String,
    iso2: String,
    dialCode: String,
    phone: String,
    created_at: { 
        type: Date,
        default: Date.now() 
    }
});
const Users = mongoose.model('users', UsersSchema);
module.exports = Users;