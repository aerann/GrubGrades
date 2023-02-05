const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAuthor, validateDish} = require('../middleware')


const Dish = require('../models/dish');


router.get('/', catchAsync (async (req, res) =>{
    const dishes = await Dish.find({})
    res.render('dishes/index', {dishes})
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('dishes/new')
})

router.get('/:id', catchAsync (async (req, res) => {
    const dish = await Dish.findById(req.params.id).populate({
        //populate all the reviews for a dish, as well as the author for the review
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'); //populate the ONE author for the dish
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

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req,res) =>{
    const {id} = req.params; 
    const dish = await Dish.findById(id)
    if(!dish){
        req.flash('error', 'Cannot find that noodle dish!')
        res.redirect('/dishes')
    }
    res.render('dishes/edit', {dish})
}));

router.put('/:id', isLoggedIn, isAuthor, validateDish, catchAsync(async(req, res) => {
    const {id} = req.params;
    const dish = await Dish.findByIdAndUpdate(id, {...req.body.dish})
    req.flash('success', 'Successfully updated your noodle dish!')
    {res.redirect(`/dishes/${dish._id}`)}
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync (async(req, res) =>{
    const {id} = req.params;
    await Dish.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted noodle dish!')
    res.redirect('/dishes')
}))

module.exports = router;
