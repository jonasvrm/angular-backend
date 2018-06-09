var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var User = require('../models/user');

// var csrfProtect = csrf();
// router.use(csrfProtect);

/* GET users listing. */
router.post('/register', function(req, res, next) {
    passport.authenticate('local.signup', function(err, user) {
        if (err) { 
            res.json(JSON.stringify(err));
        }
        if (user) { 
            return res.json(JSON.stringify(user)); 
        }       
    })(req, res, next);
  });

    
/* POST Attempt sign in */
// router.post('/login', passport.authenticate(
//     'local.signin',
//     {
//         successRedirect: __manageUrl + '/user/profile',
//         failureRedirect: __manageUrl + '/user/signin',
//         failureFlash: true
//     }
// ));

/* GET logout. */
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('signin');
});

/* GET profile page. */
router.get('/profile', function (req, res, next) {

});

/* GET all users */
router.get('/all', function (req, res, next) {
	User.find({}, function(err, users) {
        var userArray = [];
    
        users.forEach(function(user) {
            userArray.push(user);
        });
    
        res.render('user/all', { title: 'All users', users: userArray, csrfToken: req.csrfToken() });  
    });
});

module.exports = router;



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("signin");
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {       
        res.redirect("signin");
    }
    return next();
    
}