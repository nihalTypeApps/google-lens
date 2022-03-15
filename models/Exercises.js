const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ExercisesSchema = new Schema({
    title: String,
    image: String,
    description: String,
    reps: String,
    sets: String,
    weight: String,
    duration: String,
    created_at: { 
        type: Date,
        default: Date.now() 
    }
});
const Exercises = mongoose.model('exercises', ExercisesSchema);
module.exports = Exercises;