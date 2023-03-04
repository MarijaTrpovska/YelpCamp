const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn , isAuthor , validateCampground } = require('../middleware');
const campground = require('../models/campground');

//show case of CRUD functionality:

//list of all campground
router.get('/', catchAsync(async (req, res) => { 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

//create route
//create new entry - new entry page and create route 
//this part has to be before the details page (see below) because the new route will try to find anythig under the id of the show page if the show page get was before this code 
//order matters in this case
//>>
router.get('/new',isLoggedIn, (req,res) => {
    res.render('campgrounds/new');
})

//the form new is submitted to:
//validateCampground can be called as a middleware as the second parametar of the post function for validation errors  
router.post('/', isLoggedIn ,validateCampground ,catchAsync(async (req,res) => {
    //res.send(req.body); //this will be empty if we dont use app.use(express.urlencoded({ extended: true})); like we have it above
    //finally the request will look like this: {"campground":{"title":"test camp name","location":"test camp location"}}

    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; //req.user is automatically added with passport
    await campground.save();
    req.flash('success', 'Successfully made a new campground!') //uses flash that is required in app.js
    res.redirect(`/campgrounds/${campground._id}`);
}))
//<<
 
//details page  - show page
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({  //populate must be called to show the reviews, bc campground only has ObjectIDs refering to the reviews model
        path: 'reviews',    //poulate reviews for this campground
        populate: {
            path: 'author'  //nested populate to populate the author of each review
        }
    }).populate('author'); //populate the author(owner) of this campground
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show' , {campground});
}))  

//edit route -edit page
//>>
router.get('/:id/edit', isLoggedIn , isAuthor ,catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id',isLoggedIn, isAuthor ,validateCampground ,catchAsync(async (req,res) => {
    const {id} = req.params; //same as writing -> const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground /* , { runValidators: true, new: true } */); //or you can write it like below:
    //const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); // we can use the spread operator here because we group things under "campground" in edit.ejs , look at: name="campground[title]" , name="campground[location]"
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))
//<<

//delete route 
router.delete('/:id', isLoggedIn , isAuthor ,catchAsync(async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}))


module.exports = router;