var passport = require('passport');
var config = require('../config/config');
var User = require('../models/user');
var localStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local.signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {

    //validation
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty().isLength({ min: 4 });
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        } 
        if(user) {
            return done(new Error("Email already in use"), false, {message: 'Email is already in use.'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);

        newUser.save(function(err, result){
            if (err) {
                return done(err);
            } else {
                return done(null, newUser);
            }
        });
    });
}));

passport.use('local.signin', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {

    //validation
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    //check user
    User.findOne({ 'email': email }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'No user found.' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Invalid password.' });
        }
        return done(null, user);
    });
}));

passport.use('all', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : config.auth.jwtsecret
},
function (jwtPayload, cb) {
    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return User.findById(jwtPayload._id)
    .then(user => {          
        return cb(null, user);
    })
    .catch(err => {
        return cb(err);
    });
}
));

passport.use('global-admin', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : config.auth.jwtsecret
},
function (jwtPayload, cb) {
    //find the user in db if needed.
    return User.findOne({
        _id     : jwtPayload._id,
        role    : 'global_admin'
    }).then(user => {
        return cb(null, user);
    })
    .catch(err => {
        return cb(err);
    });
}
));


// passport.use('global-admin', new JWTStrategy({
//     jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//     secretOrKey   : config.auth.jwtsecret
// },
// async (jwtPayload, cb) => {
//     try {
//         //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
//         var user = await User.findById(jwtPayload._id)

//         if(user.role == "global_admin"){
//             return cb(null, user);
//         }else{
//             return cb(Error("Not authorized"));
//         }
//     } catch (error) {
//         return cb(error);
//     }
// }
// ));
