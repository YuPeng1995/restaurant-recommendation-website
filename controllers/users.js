const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
    //make sure only unique username is registered
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        //take the password & store the salt & hash the password into newUser
        const registeredUser = await User.register(newUser, password);
        //log the new user in while registering
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/restaurants');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    //go back to the url or '/restaurants' before log in
    const redirectUrl = res.locals.returnTo || '/restaurants';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        } 
        req.flash('success', "Goodbye!");
        res.redirect('/restaurants');
    });
};;