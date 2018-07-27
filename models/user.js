var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var Organisation = require('./organisation');

var userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    firstname: { type: String },
    lastname: { type: String },
    organisation: { type: Schema.Types.ObjectId, ref: 'Organisation' }
});

userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);