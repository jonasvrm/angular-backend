var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Category = require(__base + 'models/category');

var csrfProtect = csrf();
router.use(csrfProtect);

/* GET main page */
router.get('/index', function (req, res, next) {
    res.render('category/index', { title: 'Categories', errors: req.flash('error'), csrfToken: req.csrfToken() });
});

/* GET all categories */
router.get('/all', async (req, res, next) => {

    try {
        categories = await Category.find({ organisation: req.user.organisation });

        var categoryArray = [];

        categories.forEach(function (category) {
            categoryArray.push(category);
        });

        res.render('category/all', { layout: false, categories: categoryArray });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect(__manage + 'category/index');
    }
   
});

/* get UPDATE form */
router.get('/edit/:id', async (req, res, next) => {
    try {
        var category = await Category.findById(req.params.id);
        res.render('category/edit', { category: category, errors: req.flash('error'), csrfToken: req.csrfToken() });    
    } catch (error) {
        req.flash('error', error.message)
        res.redirect(__manageUrl + '/edit/' + req.params.id);
    }   
});

/* UPDATE the category */
router.post('/edit/:id', async (req, res, next) => {
    try {
        //validation
        req.checkBody('name', 'Invalid Name').notEmpty();
        var errors = req.validationErrors();

        if (errors) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });
            res.redirect(__manage + '/category/edit/'+req.params.id, req.flash('error', messages));
        }

        //load old product
        var category = await Category.findById(req.params.id);
        category.validateOrg(req.user.organisation.id);

        //apply new values
        category.name = req.body.name;

        //Save new category
        await category.save();

        res.redirect( __manageUrl + '/category/index');

    } catch (error) {
        req.flash('error', error.message)
        res.redirect(__manageUrl + '/category/edit/' + req.params.id);
    }
});

/* get INSERT form */
router.get('/add', function (req, res, next) {
    res.render('category/add', { csrfToken: req.csrfToken() });
});

/* INSERT new category */
router.post('/add', async (req, res, next) => {
    try {
        var cat = new Category({
            name: req.body.name,
            user: req.user.id,
            organisation: req.user.organisation
        });
        await cat.save();
        res.redirect(__manageUrl + '/category/index');
    } catch (err) {
        res.render('category/add', req.flash('error', err));
    }   
});

/* DELETE one categories */
router.post('/delete/:id', async (req, res, next) => {
    var message;

    var err = await Category.findByIdAndRemove(req.params.id);
    if (err)
        message = err;
    else
        message = "Success";

    res.json({ message: message });

});

module.exports = router;