var express = require('express');
var router = express.Router();
var db = require('../model/db');
/* GET users profile. */

router.get('/', function(req, res, next) {
    //let id = require('mongodb').ObjectID(req.params.id);
    let SearchStr = req.query.SearchStr.replace('+','\\+');


    var collection = db.get().collection('Contacts');

    collection.find({$or:[
     {Name:new RegExp(SearchStr,'i')}
    ,{Lname:new RegExp(SearchStr,'i')}
    ,{Phone:new RegExp(SearchStr,'i')}
    ,{Email:new RegExp(SearchStr,'i')}]}).toArray(function (err, docs) {
        if (err) {
            console.log(err);
        } else if (docs.length) {
            console.log('Found:', docs);
        } else {
            console.log('No document(s) found with defined "find" criteria!');
        }
        res.render('index', { "docs": docs, "title":`ToDo. Результат поиска ${req.query.SearchStr}`} );
        //Close connection
        //db.close();
    });

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
