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
const mongoSanitize = require('express-mongo-sanitize'); //for prevention of mongo injection   // https://www.npmjs.com/package/express-mongo-sanitize
const helmet = require('helmet');  //security tool
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo'); //https://www.npmjs.com/package/connect-mongo

//dbUrl for local : 'mongodb://localhost:27017/yelp-camp'
//dbUrl for prod : process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.set('strictQuery', false);

mongoose.connect(dbUrl)
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
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize()); //https://www.npmjs.com/package/express-mongo-sanitize

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,  //in seconds
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in a week, the calculation is in miliseconds because Date.now() is a function in miliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://cdn.jsdelivr.net",
    
];
const fontSrcUrls = [];
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dmpovndvi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
        upgradeInsecureRequests: [],
    },
}));

app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));

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