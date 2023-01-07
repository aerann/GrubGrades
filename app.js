const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const Dish = require('./models/dish');
const { rmSync } = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/grub-grades') //shopApp database
    .then(() => {
        console.log("mongo connection open")
    })
    .catch(err => {
        console.log("oh no")
        console.log(err)
    });

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join (__dirname, 'views'))

app.get('/', (req, res) =>{
    res.render('home')
})

app.get('/dishes', async (req, res) =>{
    const dishes = await Dish.find({})
    res.render('dishes/index', {dishes})
})

app.get('/dishes/:id', async (req, res) => {
    const dish = await Dish.findById(req.params.id)
    res.render('dishes/show', {dish})
})


app.listen(3000, () =>{
    console.log('Serving on port 3000')
})