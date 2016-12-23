var express = require('express');
var router = express.Router();
var TaskModel = require('../model/tasks');
var UserModel = require('../model/users');


/* GET home page. */
router.get('/', function(req, res, next) {


    TaskModel.find({})
        .populate('User')
        .exec((err, docs)=> {
        if (err) {
            console.log(err);
        } else if (docs.length) {
            console.log('Found:', docs);
        } else {
            console.log('No document(s) found with defined "find" criteria!');
        }
            UserModel.find({},(err, users) =>{
                res.render('index', { "docs": docs, "userList":users, "title":"ToDo"} );
            });
    });
});

module.exports = router;
