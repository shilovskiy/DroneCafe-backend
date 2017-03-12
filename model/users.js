/**
 * Created by Олег Шиловский on 21.12.2016.
 */
var db = require('./db');
//var mongoose = require('mongoose');
var Schema = db.mongoose.Schema;


var UserSchema = new Schema({
        LName: String,
        Name: String,
        Email: {
            type: String,
            lowercase: true
        },
        Password: String,
        Credits: Number
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
UserSchema.virtual('fullname').get(function () {
    return this.LName + ' ' + this.Name;

});

UserSchema.virtual('timeStamp').get(function () {
    return (new Date()).getUTCMilliseconds();

});

var UserModel = db.mongoose.model('users', UserSchema);


module.exports = UserModel;