//this is used to create some records in the mongo database using cities.js and seedHalpers.js
const mongoose = require('mongoose');
const cities = require('./cities');
const {places , descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const sample = array => array[Math.floor(Math.random() * array.length)];  

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor((Math.random()*1000));
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum, fuga accusamus iure corporis in nostrum assumenda asperiores doloribus consequatur. Accusantium eligendi sunt ipsum doloribus aliquid veritatis praesentium eos non dolor.',
            price
        })
        await camp.save();
    }
}


seedDB()
    .then(()=>{
        mongoose.connection.close()
    })