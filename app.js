const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const Joi = require('joi')
const {dishSchema} = require('./schemas.js')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const Dish = require('./models/dish');
const { rmSync } = require('fs');
const { validate } = require('./models/dish');

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

const validateDish = (req,res,next) => {
    const {error} = dishSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

app.get('/', (req, res) =>{
    res.render('home')
})

app.get('/dishes', catchAsync (async (req, res) =>{
    const dishes = await Dish.find({})
    res.render('dishes/index', {dishes})
}))

app.get('/dishes/new', (req, res) => {
    res.render('dishes/new')
})

app.get('/dishes/:id', validateDish, catchAsync (async (req, res) => {
    const dish = await Dish.findById(req.params.id)
    res.render('dishes/show', {dish})
}))


//create new dish to database
app.post('/dishes', validateDish, catchAsync( async(req, res, next) =>{
    const dish = new Dish(req.body.dishes)
    await dish.save(); 
    res.redirect(`/dishes/${dish._id}`)
}))

app.get('/dishes/:id/edit', catchAsync(async(req,res) =>{
    const dish = await Dish.findById(req.params.id)
    res.render('dishes/edit', {dish})
}))

app.put('/dishes/:id', validateDish, catchAsync(async(req, res) => {
    const {id} = req.params;
    const dish = await Dish.findByIdAndUpdate(id, {...req.body.dishes})
    res.redirect(`/dishes/${dish._id}`)
})
)
app.delete('/dishes/:id', catchAsync (async(req, res) =>{
    const {id} = req.params;
    await Dish.findByIdAndDelete(id)
    res.redirect('/dishes')
}))

//for every request and every path (that doesn't exist)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//error handler
app.use((err, req, res, next) =>{
    const {statusCode = "500"} = err
    if(!err.message) err.message = "Oh no, Something went wrong"
    res.status(statusCode).render('errors', {err})
})

app.listen(3000, () =>{
    console.log('Serving on port 3000')
})