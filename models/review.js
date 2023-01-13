const mongoose = require('mongoose');
const { dishSchema } = require('../schemas');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String, 
    rating: Number 
})


module.exports = mongoose.model("Review", reviewSchema)