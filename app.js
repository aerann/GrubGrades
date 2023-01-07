const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
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

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join (__dirname, 'views'))

app.use(express.urlencoded({ extended: true})) //parse request body
app.use(methodOverride('_method'));

app.get('/', (req, res) =>{
    res.render('home')
})

app.get('/dishes', async (req, res) =>{
    const dishes = await Dish.find({})
    res.render('dishes/index', {dishes})
})

app.get('/dishes/new', (req, res) => {
    res.render('dishes/new')
})

app.get('/dishes/:id', async (req, res) => {
    const dish = await Dish.findById(req.params.id)
    res.render('dishes/show', {dish})
})

//create new dish to database
app.post('/dishes', async(req,res) =>{
    const dish = new Dish(req.body.dishes)
    await dish.save(); 
    res.redirect(`/dishes/${dish._id}`)
})

app.get('/dishes/:id/edit', async(req,res) =>{
    const dish = await Dish.findById(req.params.id)
    res.render('dishes/edit', {dish})
})

app.put('/dishes/:id', async(req, res) => {
    const {id} = req.params;
    const dish = await Dish.findByIdAndUpdate(id, {...req.body.dishes})
    res.redirect(`/dishes/${dish._id}`)
})

app.delete('/dishes/:id', async(req, res) =>{
    const {id} = req.params;
    await Dish.findByIdAndDelete(id)
    res.redirect('/dishes')
})

app.listen(3000, () =>{
    console.log('Serving on port 3000')
})