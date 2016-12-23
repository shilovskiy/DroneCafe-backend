/**
 * Created by Олег Шиловский on 21.12.2016.
 */
var db = require('./db');
//var mongoose = require('mongoose');
var Schema = db.mongoose.Schema;


var UserSchema = new Schema({
    LName: String,
    Name: String,
    Phone:String,
    Email:String,
    Skype:String
 }
, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    }
);

var UserModel = db.mongoose.model('Users', UserSchema);

UserSchema.virtual('fullname').get(function(){
    return this.LName + ' ' + this.Name;

});

module.exports = UserModel;