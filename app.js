if(process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

console.log(process.env.SECRET)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');  //to be able to use put, patch or delete methods requests from the forms ejs templates (forms only send get or post request from the browser)
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')


mongoose.set('strictQuery', false);

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
app.use(express.static(path.join(__dirname,'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in a week, the calculation is in miliseconds because Date.now() is a function in miliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //for persistant log in sessions, other option is to log in in every single request (which is used in APIs but not as a user), use this after sessiong configuration (app.use(session(sessionConfig));)
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());  //store the user in the session
passport.deserializeUser(User.deserializeUser()); //unstore the user from the session


app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes); // using router for the user routes 
app.use('/campgrounds', campgroundRoutes);  //using router for the campground routes
app.use('/campgrounds/:id/reviews', reviewRoutes) //using router for reviews


//home page
app.get('/', (req,res) => {
    res.render('home')
})




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