const mongoose = require('mongoose');
const { schema } = require('./campground');
const Schema = mongoose.Schema;

const reviewScheema = new Schema({
    body: String,
    rating: Number
});


module.exports = mongoose.model("Review", reviewScheema)