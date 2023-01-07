const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DishSchema = new Schema({
    title: String, 
    price: String, 
    description: String,
    location: String
})

module.exports = mongoose.model('Dish', DishSchema)