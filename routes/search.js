var express = require('express');
var router = express.Router();
var db = require('../model/db');
var UserModel = require('../model/users');
var StateModel = require('../model/States');
var TaskModel = require('../model/items');
var async = require("async");
/* GET users profile. */

router.get('/', function(req, res, next) {
    //let id = require('mongodb').ObjectID(req.params.id);
    let SearchStr = req.query.SearchStr.replace('+','\\+');


    async.series([

            function (callback) {
                TaskModel.find({$or:[
                    {Name:new RegExp(SearchStr,'i')}
                    ,{Description:new RegExp(SearchStr,'i')}]}).populate('User').populate('State').sort('Deadline').exec(callback);
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

    // ItemModel.find({$or:[
    //  {Name:new RegExp(SearchStr,'i')}
    // ,{Description:new RegExp(SearchStr,'i')}]},(err, docs)=> {
    //     if (err) {
    //         console.log(err);
    //     } else if (docs.length) {
    //         console.log('Found:', docs);
    //     } else {
    //         console.log('No document(s) found with defined "find" criteria!');
    //     }
    //     res.render('index', { "docs": docs, "title":`ToDo. Результат поиска ${req.query.SearchStr}`} );
    //
    // });

});

router.get('/', function(req, res, next) {
    let id = req.params.id;
    //res.render('profile', { "title":"Профиль контакта"} );
    next();
});

router.param('id', function (req, res, next, id) {
    var collection = db.get().collection('Contacts');

    var user = collection.find({ _id: id });
    if (user) {
        req.user = user;
    } else {
        next(new Error('User not found'));
    }
    next();
});



module.exports = router;
