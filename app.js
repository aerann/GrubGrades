const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const {dishSchema, reviewSchema} = require('./schemas.js')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const Dish = require('./models/dish');
const Review = require('./models/review')

const dishes = require('./routes/dishes')

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



const validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

app.use('/dishes',dishes)

app.get('/', (req, res) =>{
    res.render('home')
})


app.post('/dishes/:id/reviews', validateReview, catchAsync(async(req,res) => {
    const dish = await Dish.findById(req.params.id);
    const review = new Review(req.body.review)
    dish.reviews.push(review)
    await review.save()
    await dish.save()
    res.redirect(`/dishes/${dish._id}`)
}))

app.delete('/dishes/:id/reviews/:reviewId', catchAsync(async (req,res) => {
    const {id, reviewId} = req.params; 
    await Dish.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //pulls anything with reviewId from reviews array
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/dishes/${id}`)
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