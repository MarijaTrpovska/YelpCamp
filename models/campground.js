const { func } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dmpovndvi/image/upload/w_300/v1678718629/YelpCamp/marzayd5tdme5msb1ajj.jpg  --> w_300 this part of the url is a feature from cloudinary so if you put this in this exact position you will get a thumbnail of the photo with 300 size

const ImageSchema =  new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
})

const CampgroundScheema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectID,  //Scheema =  mongoose.scheema look up
            ref: 'Review'
        }
    ]
});

//middleware for deleting the related reviews when deleting the campground
/* I'm using the model Model.findByIdAndDelete() when deleting a campground see in app.js file on delete route for campground
in the mongoose documentation https://mongoosejs.com/docs/api/model.html#model_Model-findByIdAndDelete
this fucntion triggers the following middleware : indOneAndDelete()
so we can use this one to delete the reviews out of the deleted campground as well, in the following way:
https://mongoosejs.com/docs/api/query.html#query_Query-findOneAndDelete
*/
CampgroundScheema.post('findOneAndDelete', async function (doc) {
    if (doc){ //if you find the document
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports= mongoose.model('Campground',CampgroundScheema);