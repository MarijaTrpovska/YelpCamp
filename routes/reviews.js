const express = require('express');
const router = express.Router({mergeParams: true});   //mergeParams so it can find req.params.id in the post route otherwise it will throw an error
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

//route for the reviews
router.post('/' , isLoggedIn ,validateReview , catchAsync(reviews.createReview));

//route for deleting the reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor ,catchAsync(reviews.deleteReview));


module.exports = router;