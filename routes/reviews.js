const express = require('express');
const router = express.Router({ mergeParams : true }); //allows you to have access to id
const { validateReview, isLoggedIn } = require('../middleware')
const Dish = require('../models/dish');
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')


router.post('/', isLoggedIn, validateReview, catchAsync(async(req,res) => {
    const dish = await Dish.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id
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
