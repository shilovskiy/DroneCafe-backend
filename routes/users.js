var express = require('express');
var router = express.Router();

//var db = require('../model/db');

var UserModel = require('../model/users');
/* GET home page. */
router.get('/', function(req, res, next) {


    UserModel.find({},(err, docs) =>{
        if (err) {
            console.log(err);
        } else if (docs.length) {
            console.log('Found:', docs);
        } else {
            console.log('No document(s) found with defined "find" criteria!');
        }
        res.render('users', { "docs": docs, "title":"Сотрудники"} );
        //Close connection
        //db.close();
    });



});

module.exports = router;
