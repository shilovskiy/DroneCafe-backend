var express = require('express');

var router = express.Router();

var UserModel = require('../model/users');
var StateModel = require('../model/states');
var TaskModel = require('../model/tasks');
var async = require("async");
/* GET users profile. */

router.get('/:id', function(req, res, next) {
    let id = require('mongodb').ObjectID(req.params.id);


    async.series([

            function (callback) {
                TaskModel.findOne({"_id":id}).populate('User').populate('State').exec(callback);
            },
            function (callback) {
                UserModel.find({}).exec(callback);
            },
            function (callback) {
                StateModel.find({}).exec(callback);
            },
        ]
        ,function(err,results){
            res.render('taskpage', { "docs": results[0], "userList":results[1], "stateList":results[2], "title":"Редактирование задачи"} );
        }
    );

});

router.get('/', function(req, res, next) {
    let id = req.params.id;
    //res.render('profile', { "title":"Профиль контакта"} );
    next();
});


module.exports = router;
