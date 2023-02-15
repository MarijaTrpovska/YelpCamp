const express = require('express');
const router = express.Router({mergeParams: true});   //mergeParams so it can find req.params.id in the post route otherwise it will throw an error
//const { route } = require('./campgrounds');

const Campground = require('../models/campground');
const Review = require('../models/review');

const {reviewSchema} = require('../scheemas'); // scheemas uses joi - tool for validating errors in JavaScript (not express specific) docs: https://joi.dev/api/?v=17.7.0

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');



//validate review acts as a middleware for validation errors 
const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw  new ExpressError(msg, 400)
    } else {
        next()
    }
}


//route for the reviews
router.post('/' ,validateReview , catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//route for deleting the reviews
router.delete('/:reviewId', catchAsync(async(req,res)=>{
    const {id , reviewId} = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId}}); //pull form the reviews array where we have the concrete reviewId, so it deletes the ObjectReferences in campground -> https://www.mongodb.com/docs/manual/reference/operator/update/pull/
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))


module.exports = router;