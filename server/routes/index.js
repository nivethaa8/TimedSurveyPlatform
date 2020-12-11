/* COMP229 Group Project - The Localhosts*/
// modules required for routing
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

let userRouteControl = require('../routes/users');
// define the game model
let survey = require('../models/surveys');

/* GET home page. wildcard */
router.get('/', (req, res, next) => {
  res.render('content/index', {
    title: 'Home', displayName: req.user ? req.user.displayName : '',
    surveys: ''
   });
});

/* GET Route for displaying the Login page */
router.get('/login', userRouteControl.displayLoginPage);

/* POST Route for processing the Login page */
router.post('/login', userRouteControl.processLoginPage);

/* GET Route for displaying the Register page */
router.get('/register', userRouteControl.displayRegisterPage);

/* POST Route for processing the Register page */
router.post('/register', userRouteControl.processRegisterPage);

/* GET to perform UserLogout */
router.get('/logout', userRouteControl.performLogout);

module.exports = router;
