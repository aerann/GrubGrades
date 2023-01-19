const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')

const dishes = require('./routes/dishes')
const reviews = require('./routes/reviews')

mongoose.set("strictQuery", false);

mongoose.connect('mongodb://127.0.0.1:27017/grub-grades') 
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
app.use(express.static(path.join(__dirname, 'public'))) //tells express to serve our public directory

//configuring session
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires a week from now 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)) 
app.use(flash())

//middleware to get access to flashed messages on every single request
app.use((req,res,next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next(); 
})

app.use('/dishes', dishes)
app.use('/dishes/:id/reviews', reviews) 


app.get('/', (req, res) =>{
    res.render('home')
})

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