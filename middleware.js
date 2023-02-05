const { dishSchema, reviewSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Dish = require('./models/dish')

//user can only access certain routes if they're logged in 
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in to view this page!')
        return res.redirect('/login');
    }
    next(); 
}


module.exports.validateDish = (req,res,next) => {
    const {error} = dishSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params; 
    const dish = await Dish.findById(id)
    //checking to see if you have correct authorization
    if (!dish.author.equals(req.user._id)){  
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/dishes/${id}`)
    }
    next(); 
}

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}