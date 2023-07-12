// if(process.env.NODE_ENV != "production"){
//     require('dotenv').config(); 
// }


require('dotenv').config(); 


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
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize')

const userRoutes = require('./routes/users')
const dishesRoutes = require('./routes/dishes')
const reviewsRoutes = require('./routes/reviews')

const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/grub-grades'
// process.env.DB_URL
// mongoose.set("strictQuery", false);

// mongoose.connect('mongodb://127.0.0.1:27017/grub-grades') 
//     .then(() => {
//         console.log("mongo connection open")
//     })
//     .catch(err => {
//         console.log("oh no")
//         console.log(err)
//     });

// mongodb://127.0.0.1:27017/grub-grades
mongoose.connect('mongodb://127.0.0.1:27017/grub-grades', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.set("strictQuery", false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join (__dirname, 'views'))

app.use(express.urlencoded({ extended: true})) //parse request body
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))) //tells express to serve our public directory
app.use(mongoSanitize()) //used to get rid of any $, or - to prevent mongo injection attacks

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, //session only updates once every 24 hours
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log('session store error', e)
})

//configuring session
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        // secure: true, 
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires a week from now 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)) 
app.use(flash())
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlmyi2vad/", 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


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