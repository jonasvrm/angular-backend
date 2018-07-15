var express = require('express');
var config = require('../config/config');
var router = express.Router();
var csrf = require('csurf');
var jwt = require('jsonwebtoken');
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
            const token = jwt.sign(JSON.parse(JSON.stringify(user)), config.auth.jwtsecret);
            return res.json({ user, token }); 
        }       
    })(req, res, next);
});

    
/* POST Attempt sign in */
router.post('/login', function(req, res, next) {
    passport.authenticate('local.signin', function(err, user) {
        if (err) { 
            res.json(JSON.stringify(err));
        }
        if (user) { 
            const token = jwt.sign(JSON.parse(JSON.stringify(user)), config.auth.jwtsecret);
            return res.json({ user, token, expiration: 100000 }); 
        }       
    })(req, res, next);
});

/* GET logout. */
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('signin');
});

/* GET profile page. */
router.get('/profile', function (req, res, next) {
    return res.json(req.user);
});

/* GET all users */
router.get('/all', function (req, res, next) {
	User.find({}, function(err, users) {
        var userArray = [];
    
        users.forEach(function(user) {
            userArray.push(user);
        });
    
        res.json(userArray);
    });
});

/* DELETE one product */
router.delete('/delete/:id', async (req, res, next) => {
    var message;

    try {
        await User.findByIdAndRemove(req.params.id);
        message = "Success";
    } catch (error) {
        message = "Error";
    }  

    res.json({ message: message });  
});

module.exports = router;



function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: "Invalid request." });
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {       
        res.redirect("signin");
    }
    return next();
    
}