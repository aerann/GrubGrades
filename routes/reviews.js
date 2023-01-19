const express = require('express');
const router = express.Router({ mergeParams : true }); //allows you to have access to id

const Dish = require('../models/dish');
const Review = require('../models/review')
const {reviewSchema} = require('../schemas.js')

const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

router.post('/', validateReview, catchAsync(async(req,res) => {
    const dish = await Dish.findById(req.params.id);
    const review = new Review(req.body.review)
    dish.reviews.push(review)
    await review.save()
    await dish.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/dishes/${dish._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req,res) => {
    const {id, reviewId} = req.params; 
    await Dish.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //pulls anything with reviewId from reviews array
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review!' )
    res.redirect(`/dishes/${id}`)
}))

module.exports = router; 
