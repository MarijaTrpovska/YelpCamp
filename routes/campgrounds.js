const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn , isAuthor , validateCampground } = require('../middleware');
const campground = require('../models/campground');

//show case of CRUD functionality:

//list of all campgrounds
router.get('/', catchAsync(campgrounds.index));

//create route
//create new entry - new entry page and create route 
//this part has to be before the details page (see below) because the new route will try to find anythig under the id of the show page if the show page get was before this code 
//order matters in this case
//>>
router.get('/new',isLoggedIn, campgrounds.renderNewForm )

//the form new is submitted to:
//validateCampground can be called as a middleware as the second parametar of the post function for validation errors  
router.post('/', isLoggedIn ,validateCampground ,catchAsync(campgrounds.createCampground))
//<<
 
//details page  - show page
router.get('/:id', catchAsync(campgrounds.showCampground));  

//edit route -edit page
//>>
router.get('/:id/edit', isLoggedIn , isAuthor ,catchAsync(campgrounds.renderEditFrom))

router.put('/:id',isLoggedIn, isAuthor ,validateCampground ,catchAsync(campgrounds.updateCampground))
//<<

//delete route 
router.delete('/:id', isLoggedIn , isAuthor ,catchAsync(campgrounds.deleteCampground))


module.exports = router;