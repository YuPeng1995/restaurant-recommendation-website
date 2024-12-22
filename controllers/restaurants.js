//MVC method - models & views & controllers
const Restaurant = require('../models/restaurant');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
//instantiate a new Mapbox geocoding instance
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const restaurants = await Restaurant.find({});
    res.render('restaurants/index', { restaurants });
};

module.exports.renderNewForm = (req, res) => {
    res.render('restaurants/new');
};

module.exports.createRestaurant = async (req, res) => {
    //geocoding
    const geoData = await geocoder.forwardGeocode({
        query: req.body.restaurant.location,
        limit: 1
    }).send();
    // if (!req.body.restaurant) {throw new ExpressError("Invalid restaurant data.", 400)};
    const restaurant = new Restaurant(req.body.restaurant);
    //save geocoding to database
    restaurant.geometry = geoData.body.features[0].geometry;
    //save url & filename to restaurant we created
    restaurant.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    restaurant.author = req.user._id;
    await restaurant.save();
    req.flash('success', 'Successfully made a new restaurant!')
    res.redirect(`/restaurants/${restaurant._id}`)
};

module.exports.showRestaurant = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(restaurant)
    if (!restaurant) {
        req.flash('error', 'Cannot find that restaurant!');
        return res.redirect('/restaurants');
    };
    res.render('restaurants/show', { restaurant });
};

module.exports.renderEditForm = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        req.flash('error', 'Cannot find that restaurant!');
        return res.redirect('/restaurants');
    };
    res.render('restaurants/edit', { restaurant });
};

module.exports.updateRestaurant = async (req, res) => {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, req.body.restaurant);
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    //push an array to an array
    restaurant.images.push(...imgs);
    await restaurant.save();
    if (req.body.deleteImages) {
        //delete the images in cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        //delete the images in the deleteImages[] in mongo
        await restaurant.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated restaurant!');
    res.redirect(`/restaurants/${id}`);
};

module.exports.deleteRestaurant = async (req, res) => {
    await Restaurant.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted restaurant!');
    res.redirect('/restaurants');
};