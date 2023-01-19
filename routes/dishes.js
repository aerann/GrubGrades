const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const { dishSchema } = require('../schemas.js')
const ExpressError = require('../utils/ExpressError')
const Dish = require('../models/dish');

const validateDish = (req,res,next) => {
    const {error} = dishSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

router.get('/', catchAsync (async (req, res) =>{
    const dishes = await Dish.find({})
    res.render('dishes/index', {dishes})
}))

router.get('/new', (req, res) => {
    res.render('dishes/new')
})

router.get('/:id', catchAsync (async (req, res) => {
    const dish = await Dish.findById(req.params.id).populate('reviews')
    res.render('dishes/show', {dish})
}))


//create new dish to database
router.post('/', validateDish, catchAsync( async(req, res, next) =>{
    console.log(req.body)
    const dish = new Dish(req.body.dish)
    await dish.save(); 
    res.redirect(`/dishes/${dish._id}`)
}))

router.get('/:id/edit', catchAsync(async(req,res) =>{
    const dish = await Dish.findById(req.params.id)
    res.render('dishes/edit', {dish})
}))

router.put('/:id', validateDish, catchAsync(async(req, res) => {
    console.log("this is req.body", req.body)
    const {id} = req.params;
    const dish = await Dish.findByIdAndUpdate(id, {...req.body.dish})
    {res.redirect(`/dishes/${dish._id}`)}
})
)
router.delete('/:id', catchAsync (async(req, res) =>{
    const {id} = req.params;
    await Dish.findByIdAndDelete(id)
    res.redirect('/dishes')
}))

module.exports = router;
