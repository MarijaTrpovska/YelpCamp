const express = require('express');
const router = express.Router({mergeParams: true});   //mergeParams so it can find req.params.id in the post route otherwise it will throw an error
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

//route for the reviews
router.post('/' , isLoggedIn ,validateReview , catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//route for deleting the reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor ,catchAsync(async(req,res)=>{
    const {id , reviewId} = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId}}); //pull form the reviews array where we have the concrete reviewId, so it deletes the ObjectReferences in campground -> https://www.mongodb.com/docs/manual/reference/operator/update/pull/
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))


module.exports = router;