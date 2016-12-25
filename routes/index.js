var express = require('express');
var router = express.Router();

var UserModel = require('../model/users');
var StateModel = require('../model/states');
var TaskModel = require('../model/tasks');
var async = require("async");

/* GET home page. */
router.get('/', function(req, res, next) {

    async.series([

        function (callback) {
            TaskModel.find({}).populate('User').populate('State').sort('-Deadline').exec(callback);
        },
        function (callback) {
            UserModel.find({}).exec(callback);
        },
        function (callback) {
            StateModel.find({}).exec(callback);
        },
        ]
        ,function(err,results){
            res.render('index', { "docs": results[0], "userList":results[1], "stateList":results[2], "title":"ToDo"} );
        }
    );

});

module.exports = router;
