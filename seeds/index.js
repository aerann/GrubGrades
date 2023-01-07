// Seeds Database (deletes everything in database first)
const mongoose = require('mongoose')
const cities = require('./cities')
const {foods, descriptors} =  require('./seedHelpers')
const Dish = require('../models/dish');

mongoose.connect('mongodb://127.0.0.1:27017/grub-grades') //shopApp database
    .then(() => {
        console.log("mongo connection open")
    })
    .catch(err => {
        console.log("oh no")
        console.log(err)
    });

// returns a random element from array
const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async() => {
    await Dish.deleteMany({}); 
    for(let i =0; i<50; i++){
        const random1000 = Math.floor(Math.random() * 1000); 
        const dish = new Dish({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(foods)}` //random name of dish
        })
        await dish.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})