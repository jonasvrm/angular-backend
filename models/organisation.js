var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Category = require('./category');
var User = require('./user');

var orgSchema = new Schema({
    name: { type: String, required: true },
    categories: [Category.schema],
    users: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    locale: { type: String, default: 'en-US' }
});

module.exports = mongoose.model('Organisation', orgSchema);