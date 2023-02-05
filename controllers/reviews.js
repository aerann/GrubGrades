const Dish = require('../models/dish');
const Review = require('../models/review')

module.exports.createReview = async(req,res) => {
    const dish = await Dish.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id
    dish.reviews.push(review)
    await review.save()
    await dish.save()
    req.flash('success', 'Created new review!')
    res.redirect(`/dishes/${dish._id}`)
}

module.exports.deleteReview = async (req,res) => {
    const {id, reviewId} = req.params; 
    console.log('id..', id)
    await Dish.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //pulls anything with reviewId from reviews array
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/dishes/${id}`)
}