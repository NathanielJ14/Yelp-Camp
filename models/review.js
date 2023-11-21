const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Setting up reviews db
const reviewSchema = new Schema({
    body: String,
    rating: Number
});

module.exports = mongoose.model("Review", reviewSchema);