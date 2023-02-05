const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const { dishSchema } = require('../schemas.js')
const {isLoggedIn} = require('../middleware')


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

router.get('/new', isLoggedIn, (req, res) => {
    res.render('dishes/new')
})

router.get('/:id', catchAsync (async (req, res) => {
    const dish = await Dish.findById(req.params.id).populate('reviews').populate('author');
    console.log(dish)
    if(!dish){
        req.flash('error', 'Cannot find that noodle dish!')
        res.redirect('/dishes')
    }
    res.render('dishes/show', {dish})
}))

//create new dish to database
router.post('/', isLoggedIn, validateDish, catchAsync( async(req, res, next) =>{
    const dish = new Dish(req.body.dish)
    dish.author = req.user._id; 
    await dish.save(); 
    req.flash('success', 'Successfully added a new noodle dish!')
    res.redirect(`/dishes/${dish._id}`)
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async(req,res) =>{
    const {id} = req.params; 
    const dish = await Dish.findById(id)
    if(!dish){
        req.flash('error', 'Cannot find that noodle dish!')
        res.redirect('/dishes')
    }
    //checking to see if you own the dish, if not you can not view the edit page
    if (!dish.author.equals(req.user._id)){  
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/dishes/${id}`)
    }
    res.render('dishes/edit', {dish})
}))

router.put('/:id', isLoggedIn, validateDish, catchAsync(async(req, res) => {
    const {id} = req.params;
    const dish = await Dish.findById(id)
    //checking to see if you have correct authorization
    if (!dish.author.equals(req.user._id)){  
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/dishes/${id}`)
    }
    const dish2 = await Dish.findByIdAndUpdate(id, {...req.body.dish})
    req.flash('success', 'Successfully updated your noodle dish!')
    {res.redirect(`/dishes/${dish._id}`)}
})
)
router.delete('/:id', isLoggedIn, catchAsync (async(req, res) =>{
    const {id} = req.params;
    await Dish.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted noodle dish!')
    res.redirect('/dishes')
}))

module.exports = router;
