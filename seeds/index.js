const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Restaurant = require('../models/restaurant');

mongoose.connect('mongodb://127.0.0.1:27017/best-Chinese-restaurants');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected...');
});

const sample = function (array) {
    return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
    await Restaurant.deleteMany({});
    for (let i = 0; i < 100; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const restaurant = new Restaurant({
            author: '6609bf72250381fa2e45c02e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'suedhoiwehdoiwehdpowhediohwqeoidwejdoiewjdpowjeeragtretgsretgsrttgsgtsgttsrgtgs',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/db67s9wwj/image/upload/v1711402758/YelpCamp/kmuouk0zqi2jz3fsxhrr.jpg',
                    filename: 'BestChineseRestaurant/kmuouk0zqi2jz3fsxhrr',
                },
                {
                    url: 'https://res.cloudinary.com/db67s9wwj/image/upload/v1711403201/YelpCamp/htasb0bqo9op3y2svchp.jpg',
                    filename: 'Restaurant/htasb0bqo9op3y2svchp',
                }
            ]
        });
        await restaurant.save();
    }
};


seedDB().then(() => {
    mongoose.connection.close();
});