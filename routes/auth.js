const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Login page  
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        res.redirect('/auth/register');
    }
});

// Login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/portfolio/dashboard',  
    failureRedirect: '/auth/login'
}));

// Logout - FIXED
router.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/");  // Redirect to homepage instead of /listings
    });
});

module.exports = router;