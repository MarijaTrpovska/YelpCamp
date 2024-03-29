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
    for(let i = 0; i < 300; i++){
        const random1000 = Math.floor((Math.random()*1000));
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '63f778aee5e2dfc3dd3c67c1',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum, fuga accusamus iure corporis in nostrum assumenda asperiores doloribus consequatur. Accusantium eligendi sunt ipsum doloribus aliquid veritatis praesentium eos non dolor.',
            price,
            geometry: { 
                type: 'Point', 
                coordinates: [ 
                    cities[random1000].longitude , 
                    cities[random1000].latitude 
                ] 
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dmpovndvi/image/upload/v1678489692/YelpCamp/s4fn9m2ds5tigj0u5slq.jpg',
                  filename: 'YelpCamp/s4fn9m2ds5tigj0u5slq'
                },
                {
                  url: 'https://res.cloudinary.com/dmpovndvi/image/upload/v1678489693/YelpCamp/bnuz2dgxrfd1janzg20a.jpg',
                  filename: 'YelpCamp/bnuz2dgxrfd1janzg20a'
                },
                {
                  url: 'https://res.cloudinary.com/dmpovndvi/image/upload/v1678489694/YelpCamp/bl02ckd0c6rrwb05x7bg.jpg',
                  filename: 'YelpCamp/bl02ckd0c6rrwb05x7bg'
                }
              ]
        })
        await camp.save();
    }
}


seedDB()
    .then(()=>{
        mongoose.connection.close()
    })