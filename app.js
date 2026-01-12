require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/database');
require('./config/passport');

const app = express();

connectDB();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Session configuration - MOVE THIS UP
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Passport middleware - MOVE THIS UP
app.use(passport.initialize());
app.use(passport.session());

// Routes - NOW THESE COME AFTER SESSION/PASSPORT
app.use('/auth', require('./routes/auth'));
app.use('/portfolio', require('./routes/portfolio'));
app.use('/api/stocks', require('./routes/stock'));

app.get('/', (req, res) => {
    res.render('home');
});

module.exports = app;
