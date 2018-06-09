var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Organisation = require(__base + 'models/organisation');
var ObjectID = require('mongoose').Types.ObjectId;


var csrfProtect = csrf();
router.use(csrfProtect);

/* GET main page */
router.get('/index', function (req, res, next) {
    res.render('organisation/index', { title: 'Organisations', csrfToken: req.csrfToken() });
});

/* GET all Organisations */
router.get('/all', function (req, res, next) {

    Organisation.find({}, function (err, organisations) {
        var organisationArray = [];

        organisations.forEach(function (organisation) {
            organisationArray.push(organisation);
        });

        res.render('organisation/all', { layout: false, organisations: organisationArray });
    });
});

/* get UPDATE form */
router.get('/edit/:id', function (req, res, next) {
    Organisation.findById(req.params.id, function (err, organisation) {
        res.render('organisation/edit', { organisation: organisation, csrfToken: req.csrfToken() });
    });
});

/* UPDATE the Organisation */
router.post('/edit/:id', function (req, res, next) {

    Organisation.findById(req.params.id, function(err, organisation) {
      
        organisation.name = req.body.name;

        if(ObjectID.isValid(req.body.user)){
            organisation.users.push(req.body.user);
        }    

        // Using a promise rather than a callback
        organisation.save(function(err) {
            if (err) {
                res.render('error', { message: err.message });
            } else {
                res.redirect('/organisation/index');
            }
        });
    });
});

/* get INSERT form */
router.get('/add', function (req, res, next) {
    res.render('organisation/add', { csrfToken: req.csrfToken() });
});

/* INSERT new Organisation */
router.post('/add', function (req, res, next) {
    var org = new Organisation({
        name: req.body.name
    });

    org.save(function (err, result) {
        if (err) {

        } else {
            res.redirect('/organisation/index');
        }
    });
});

/* DELETE one Organisations */
router.post('/delete/:id', function (req, res, next) {
    var message;

    Organisation.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            message = err;
        else
            message = "Success";
    });

    res.json({ message: message });

});

module.exports = router;