const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); //https://github.com/mapbox/mapbox-sdk-js
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken});  //https://github.com/mapbox/mapbox-sdk-js/blob/main/docs/services.md#geocoding
const { cloudinary } = require("../cloudinary"); 

module.exports.index = async (req, res) => { 
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res) => {
    //res.send(req.body); //this will be empty if we dont use app.use(express.urlencoded({ extended: true})); like we have it above
    //finally the request will look like this: {"campground":{"title":"test camp name","location":"test camp location"}}
    
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    //console.log(geoData); //too see what we have in the response
    //console.log(geoData.body.features);  // to see what we have in the features of response
    //console.log(geoData.body.features[0].geometry.coordinates); //to get the coordinates
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id; //req.user is automatically added with passport
    await campground.save();
    req.flash('success', 'Successfully made a new campground!'); //uses flash that is required in app.js
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
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
}

module.exports.renderEditFrom = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req,res) => {
    const {id} = req.params; //same as writing -> const id = req.params.id;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground ); //or you can write it like below:
    //const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); // we can use the spread operator here because we group things under "campground" in edit.ejs , look at: name="campground[title]" , name="campground[location]"
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) { 
        for (let filename of req.body.deleteImages) { //deleting imgs form cloudinary (first)
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages }}}}); //deleting imgs from mongo
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}