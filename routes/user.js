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
router.get('/all', passport.authenticate('global-admin', {session: false}), async (req, res, next) => {

    var users = await User.find({}, { password: 0 });
    
    res.json(users);
});

/* DELETE one user */
router.delete('/:id', async (req, res, next) => {
    var message;

    try {
        await User.findByIdAndRemove(req.params.id);
        message = "Success";
    } catch (error) {
        message = "Error";
    }  

    res.status(200).json(message);  
});

/* GET one user */
router.get('/:id', passport.authenticate('all', {session: false}), async (req, res, next) => {
    try {
        var user = await User.findById(req.params.id, { password: 0 });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error fetching the user" });
    }  
});

/* UPDATE the user */
router.patch('/:id', async (req, res, next) => {
    var message;
    
    try {
        //load old product
        var user = await User.findById(req.params.id);

        //apply new values
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;

        //Save new category
        await user.save();

        message = "success";
    } catch (error) {

        message = "error";
    }

    res.status(200).json(message);
});

module.exports = router;