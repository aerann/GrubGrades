const Dish = require('../models/dish');
const { cloudinary } = require("../cloudinary")

module.exports.index = async (req, res) =>{
    const dishes = await Dish.find({})
    res.render('dishes/index', {dishes})
}

module.exports.renderNewForm = (req, res) => {
    res.render('dishes/new')
}

module.exports.createDish = async(req, res, next) =>{
    
    const dish = new Dish(req.body.dish)
    dish.images = req.files.map(f => ({url: f.path, filename: f.filename })) //take file path and file name and make an object for the image
    dish.author = req.user._id; 
    await dish.save(); 
    console.log(dish)
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
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename }))
    dish.images.push(...imgs) //push image data 
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename) //delete file in cloudinary
        }
        //remove photos from mongo
        await dish.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}}) //pull elements out of the images array
    }
    await dish.save()
    req.flash('success', 'Successfully updated your noodle dish!')
    {res.redirect(`/dishes/${dish._id}`)}
}

module.exports.deleteDish = async(req, res) =>{
    const {id} = req.params;
    await Dish.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted noodle dish!')
    res.redirect('/dishes')
}