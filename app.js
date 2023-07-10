if(process.env.NODE_ENV != "production"){
    require('dotenv').config(); 
}

const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const mongoSanitize = require('express-mongo-sanitize')

const userRoutes = require('./routes/users')
const dishesRoutes = require('./routes/dishes')
const reviewsRoutes = require('./routes/reviews')

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
app.use(mongoSanitize()) //used to get rid of any $, or - to prevent mongo injection attacks

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

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

//tells passport how to seralize a user
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


//middleware to get access to flashed messages on every single request
//access to currentUser in all templates
app.use((req,res,next) => {
    console.log(req.session)
    res.locals.currentUser = req.user; //gives us information on the currentUser (given from passport)
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next(); 
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'ann@gmail.com', username: 'ann'})
    const newUser = await User.register(user, 'chicken')
    res.send(newUser)
})

app.use('/', userRoutes);
app.use('/dishes', dishesRoutes)
app.use('/dishes/:id/reviews', reviewsRoutes) 


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