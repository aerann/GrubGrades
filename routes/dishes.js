const express = require('express');
const router = express.Router();
const dishes = require('../controllers/dishes')
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAuthor, validateDish} = require('../middleware')

router.get('/', catchAsync(dishes.index));

router.get('/new', isLoggedIn, dishes.renderNewForm)

router.get('/:id', catchAsync(dishes.showDish))

//create new dish to database
router.post('/', isLoggedIn, validateDish, catchAsync(dishes.createDish))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(dishes.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, validateDish, catchAsync(dishes.updateDish))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync (dishes.deleteDish))

module.exports = router;
