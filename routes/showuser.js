var express = require('express');
var router = express.Router();
var UserModel = require('../model/users');
/* GET users profile. */

router.get('/:id', function(req, res, next) {
    let id = require('mongodb').ObjectID(req.params.id);

   UserModel.findOne({"_id":id},(err, oneUser) =>{
        if (err) {
            console.log(err);

        } else {
            console.log('No document(s) found with defined "find" criteria!');
        }
        res.render('profile', { 'docs': oneUser, 'title':'Сведения о контакте '+oneUser.fullname,'nextaction':`/edituserdata/${id}`} );
    });

});

router.get('/', function(req, res, next) {
    let id = req.params.id;
    //res.render('profile', { "title":"Профиль контакта"} );
    next();
});


module.exports = router;
