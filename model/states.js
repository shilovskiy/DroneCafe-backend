/**
 * Created by Олег Шиловский on 21.12.2016.
 */
var db = require('./db');
//var mongoose = require('mongoose');
var Schema = db.mongoose.Schema;

var StateSchema = new Schema({
    Name: {type:String,unique:true},
});

var StateModel= db.mongoose.model('States', StateSchema);

module.exports = StateModel;