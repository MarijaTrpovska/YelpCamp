const { campgroundSchema , reviewSchema } = require('./scheemas'); // scheemas uses joi - tool for validating errors in JavaScript (not express specific) docs: https://joi.dev/api/?v=17.7.0
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){     
        const { id } = req.params;  
        //req.session.returnTo = req.originalUrl; //old version of below:
        req.session.returnTo = (req.query._method === 'DELETE' ? `/campgrounds/${id}` : req.originalUrl);  //check this!!! it was a fix for protecting the unauthorised delete review
        req.flash('error', 'You must be signed in');
        return res.redirect('/login')
    }
    next();
}

//validate campground acts as a middleware for validation errors 
module.exports.validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw  new ExpressError(msg, 400)
    } else {
        next()
    }
}

//middleware for validating if the current logged in user is the owner of the campground
module.exports.isAuthor = async(req,res,next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission for that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//middleware for validating if the current user is the owner of the review
module.exports.isReviewAuthor = async(req,res,next) => {
    const {id,  reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission for that!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


//validate review acts as a middleware for validation errors 
module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw  new ExpressError(msg, 400)
    } else {
        next()
    }
}



