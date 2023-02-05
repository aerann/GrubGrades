const Dish = require('../models/dish');

module.exports.index = async (req, res) =>{
    const dishes = await Dish.find({})
    res.render('dishes/index', {dishes})
}

module.exports.renderNewForm = (req, res) => {
    res.render('dishes/new')
}

module.exports.createDish = async(req, res, next) =>{
    const dish = new Dish(req.body.dish)
    dish.author = req.user._id; 
    await dish.save(); 
    req.flash('success', 'Successfully added a new noodle dish!')
    res.redirect(`/dishes/${dish._id}`)
}

module.exports.showDish = async (req, res) => {
    const dish = await Dish.findById(req.params.id).populate({
        //populate all the reviews for a dish, as well as the author for the review
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'); //populate the ONE author for the dish
    if(!dish){
        req.flash('error', 'Cannot find that noodle dish!')
        res.redirect('/dishes')
    }
    res.render('dishes/show', {dish})
}

module.exports.renderEditForm = async(req,res) =>{
    const {id} = req.params; 
    const dish = await Dish.findById(id)
    if(!dish){
        req.flash('error', 'Cannot find that noodle dish!')
        res.redirect('/dishes')
    }
    res.render('dishes/edit', {dish})
}

module.exports.updateDish = async(req, res) => {
    const {id} = req.params;
    const dish = await Dish.findByIdAndUpdate(id, {...req.body.dish})
    req.flash('success', 'Successfully updated your noodle dish!')
    {res.redirect(`/dishes/${dish._id}`)}
}

module.exports.deleteDish = async(req, res) =>{
    const {id} = req.params;
    await Dish.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted noodle dish!')
    res.redirect('/dishes')
}