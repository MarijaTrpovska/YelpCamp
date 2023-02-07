const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {campgroundSchema} = require('./scheemas'); // scheemas uses joi - tool for validating errors in JavaScript (not express specific) docs: https://joi.dev/api/?v=17.7.0
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');  //to be able to use put, patch or delete methods requests from the forms ejs templates (forms only send get or post request from the browser)
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({ extended: true}));  //we need this so it can parse the body of the request when creating a new entry (campground)
app.use(methodOverride('_method'));  //we need this to make a put requests form the ejs templates form (mostly for the edit put request)

//validate campground acts as a middleware for validating errors 
const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',');
        throw  new ExpressError(msg, 400)
    } else {
        next()
    }
}

//home page
app.get('/', (req,res) => {
    res.render('home')
})

//show case of CRUD functionality:

//list of all campground
app.get('/campgrounds', catchAsync(async (req, res) => { 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

//create route
//create new entry - new entry page and create route 
//this part has to be before the details page (see below) because the new route will try to find anythig under the id of the show page if the show page get was before this code 
//order matters in this case
//>>
app.get('/campgrounds/new', (req,res) => {
    res.render('campgrounds/new');
})

//the form new is submitted to:
//validateCampground can be called as a middleware as the second parametar of the post function for validation errors  
app.post('/campgrounds', validateCampground ,catchAsync(async (req,res) => {
    //res.send(req.body); //this will be empty if we dont use app.use(express.urlencoded({ extended: true})); like we have it above
    //finally the request will look like this: {"campground":{"title":"test camp name","location":"test camp location"}}


    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
//<<
 
//details page  - show page
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show' , {campground});
}))  

//edit route -edit page
//>>
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id',validateCampground ,catchAsync(async (req,res) => {
    const {id} = req.params; //same as writing -> const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground /* , { runValidators: true, new: true } */); //or you can write it like below:
    //const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); // we can use the spread operator here because we group things under "campground" in edit.ejs , look at: name="campground[title]" , name="campground[location]"
    res.redirect(`/campgrounds/${campground._id}`);
}))
//<<

//delete route 
app.delete('/campgrounds/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

//this will only run if non of the previous routes didn't respond with anything!!! order is important!
app.all('*', (req,res, next)=>{
    next(new ExpressError('Page not found', 404))
})

//middleware that is catch all for any error 
//Error is extended with message and status code in ./utils/ExpressError.js
app.use((err,req,res,next)=>{
    const {statusCode = 500 } = err;  // these are the extension fileds of the class Error with their default values
    if(!err.message) err.message = 'Oh No! Something went wrong!';
    res.status(statusCode).render('error', {err});
})


app.listen(3000 , () => {
    console.log('Serving on port 3000')
})