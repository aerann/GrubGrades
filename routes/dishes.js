const express = require('express');
const router = express.Router();
const dishes = require('../controllers/dishes')
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAuthor, validateDish} = require('../middleware')
const Dish = require('../models/dish')

//used for parsing images
const multer = require('multer') 
const { storage } = require('../cloudinary') //node automatically looks for index in a file
const upload = multer({ storage }) //sets destination for your images



router.route('/')
    .get(catchAsync(dishes.index))
    .post(isLoggedIn, upload.array('image'), catchAsync(dishes.createDish))

//needs to go before id route, or else will mistaken new as an id
router.get('/new', isLoggedIn, dishes.renderNewForm)

router.route('/:id')
    .get(catchAsync(dishes.showDish))
    .put(isLoggedIn, isAuthor, validateDish, catchAsync(dishes.updateDish))
    .delete(isLoggedIn, isAuthor, catchAsync (dishes.deleteDish))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(dishes.renderEditForm))

module.exports = router;
