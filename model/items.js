/**
 * Created by Олег Шиловский on 21.12.2016.
 */
var db = require('./db');
//var mongoose = require('mongoose');
var Schema = db.mongoose.Schema;

var ItemSchema = new Schema({
    title: {type:String}, //,unique:true
    image: String,
    rating:Number,
    price:Number


});

var ItemModel= db.mongoose.model('items', ItemSchema);

module.exports = ItemModel;