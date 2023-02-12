const { func } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const CampgroundScheema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectID,  //Scheema =  mongoose.scheema look up
            ref: 'Review'
        }
    ]
});

//middleware for deleting the related reviews when deleting the campground
/* we are using the model Model.findByIdAndDelete() when deleting a campground see in app.js file on delete route for campground
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