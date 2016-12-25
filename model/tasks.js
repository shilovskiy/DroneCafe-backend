/**
 * Created by Олег Шиловский on 21.12.2016.
 */
var db = require('./db');
//var mongoose = require('mongoose');
var Schema = db.mongoose.Schema;

var TaskSchema = new Schema({
    Name: {type:String,unique:true},
    Description: String,
    User:{
        type: Schema.ObjectId,
        ref: 'Users'
    },
    State:{
        type:Schema.ObjectId,
        ref:'States'
    },
    Deadline:String

});

var TaskModel= db.mongoose.model('Task', TaskSchema);

module.exports = TaskModel;