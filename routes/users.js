const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

//Routes for registration
router.get('/register', users.renderRegister);

router.post('/register', catchAsync(users.register));

//Routes for login
router.get('/login', users.renderLogin);

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//Routes for logout
router.get('/logout', users.logout);

module.exports = router;