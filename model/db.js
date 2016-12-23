/**
 * Created by Олег Шиловский on 11.12.2016.
 */
var mongoose =  require('mongoose');
//mongoose.connect('mongodb://localhost:27017/TodODB_v1');

exports.mongoose = mongoose;


var MongoClient = require('mongodb').MongoClient;

var state = {
    db: null,
};

exports.connect = function(dburl, done) {
    if (state.db) return done;

    MongoClient.connect(dburl, function(err, db) {
        if (err) return done(err);
        state.db = db;

    })
};

exports.get = function() {
    return state.db
};

exports.close = function(done) {
    if (state.db) {
        state.db.close(function(err, result) {
            state.db = null;
            state.mode = null;
            //done(err)
        })
    }
};