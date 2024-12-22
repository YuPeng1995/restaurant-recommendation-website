const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const Restaurant = require('./restaurant');

// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

//use vitual to edit the url so we don't need to store it in database
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

//helps properties shown in restaurants
const options = {toJSON: {virtuals: true}};

const RestaurantSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, options);

//virtual properties.popUpMarkup
RestaurantSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href='/restaurants/${this._id}'>${this.title}</a><strong>`
});

RestaurantSchema.post('findOneAndDelete', async function (restaurant) {
    if (restaurant) {
        await Review.deleteMany({
            _id: {
                $in: restaurant.reviews
            }
        })
    }
})

module.exports = mongoose.model('Restaurant', RestaurantSchema);