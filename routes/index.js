var express = require('express');
var router = express.Router();

var UserModel = require('../model/users');
var StateModel = require('../model/states');
var TaskModel = require('../model/tasks');
var async = require("async");
const perPage = 2;
/* GET home page. */
router.get('/', function(req, res, next) {

    var page =req.query.page!=undefined?req.query.page:1;

    async.series([

        function (callback) { //0
            TaskModel.find({})
                .populate('User')
                .populate('State')
                .limit(perPage)
                .skip(perPage * (page-1))
                .sort('Deadline')
                .exec(callback);
        },
        function (callback) {//1
            UserModel.find({}).exec(callback);
        },
        function (callback) {//2
            StateModel.find({}).exec(callback);
        },
        function (callback) {//3
            TaskModel.count({}).exec(callback);
        },

        ]
        ,function(err,results){
            let pagination = parseInt(results[3]/perPage,0)+1;
            res.render('index', { "docs": results[0],"pageAmount":pagination, "userList":results[1], "stateList":results[2], "title":"ToDo"} );
        }
    );

});

module.exports = router;
