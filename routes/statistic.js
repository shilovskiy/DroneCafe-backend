var express = require('express');
var router = express.Router();

var UserModel = require('../model/users');
var StateModel = require('../model/States');
var TaskModel = require('../model/items');
var async = require("async");

/* GET home page. */
router.get('/', function(req, res, next) {

    async.series([

        function (callback) {
            TaskModel.aggregate(
                {
                    $lookup:
                        {
                            from: 'states',
                            localField: 'State',
                            foreignField: '_id',
                            as: 'Stateid'
                        }
                }
                ,{$match :{'Stateid.Name':'Closed'}}
                ,{$project:{User:1,count:{$add:[1]}}}
                ,{$group:{_id:'$User',total:{$sum:"$count"}}}
                ,{
                    $lookup:
                        {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'UserName'
                        }
                }
            ).sort('-count').exec(callback);
        },
        // function (callback) {
        //     UserModel.find({}).exec(callback);
        // },
        // function (callback) {
        //     StateModel.find({}).exec(callback);
        // },
        ]
        ,function(err,results){
            res.render('statistic', { "docs": results[0]} );//, "userList":results[1], "stateList":results[2], "title":"ToDo"
        }
    );

});

module.exports = router;
