const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const User = require('../models/user');
const users = require('../controllers/users');

//using the route functionality to slim down the code 
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

/* these 2 routes are same as above

router.get('/register', users.renderRegister);
 
router.post('/register',catchAsync(users.register)) */

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}) , users.login)

/* router.get('/login', users.renderLogin)

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}) , users.login ) */

router.get('/logout', users.logout)

module.exports = router;