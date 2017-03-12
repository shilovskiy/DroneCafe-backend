var express = require('express');
var router = express.Router();
var UserModel = require('../model/users');
var StateModel = require('../model/States');
var ItemModel = require('../model/items');
var OrderModel = require('../model/orders');

var async = require("async");

/* GET users profile. */
var headerType = 'application/json;charset=UTF-8';


router.post('/auth', function (req, res, next) {
    if ((req.headers['content-type'] == headerType) && (req.headers['content-length'] !== "0")) {
        let username = req.body['username'];
        let pass = req.body['password'];


        var query = {'Name': username, 'Password': pass};


        async.auto({
            isUserExist: function (callback) {
                UserModel.find(query,{Name: 1, LName: 1, Credits: 1}).limit(1).exec((err, _user) => {
                    callback(err, {bool:(_user.length > 0),uObj:_user});
                });
            },

            User: ['isUserExist', function (user, callback) {
                if (user.isUserExist.bool) {

                    callback(undefined, user.isUserExist.uObj);

                }
                else {
                    //No Order No Meal ^)
                    let newUser = UserModel();

                    newUser.LName = username;
                    newUser.Password = pass;
                    newUser.Credits = 100;
                    newUser.Name = 'User'+(new Date()).getTime();

                    newUser.save((err, doc) => {
                        if (err) {
                            callback(new Error(err.message, 500), null);
                        }
                        else {
                            callback(err, doc);

                        }
                    });

                }

            }],
            // Final depends on both 'one' and 'two' being completed and their results
            final: ['isUserExist', 'User', function (results, err) {
                // results is now equal to: {one: 1, two: 2}
                console.log(results);
                res.writeHead(206, 'OK', {'Content-Type': 'application/json'});
                res.write(JSON.stringify(results.User[0]));
                res.end();
            }]
        });





    }


});

//addCredits

router.post('/addCredits', function (req, res, next) {
    if ((req.headers['content-type'] == headerType) && (req.headers['content-length'] !== "0")) {
        let username = req.body['username'];
        let amount = req.body['amount'];


        let query = {_id: username._id};

        UserModel.findOne(query, {Name: 1, LName: 1, Credits: 1, timeStamp: 1})
            .exec((err, oneUser) => {
                if (err) {
                    res.writeHead(401, 'WWW-Authenticate', {'Content-Type': 'text/plain; charset=utf-8'});
                    res.write(JSON.stringify(req.body));
                    res.end();

                } else {

                    if (oneUser.Credits !== undefined) {
                        oneUser.Credits = oneUser.Credits + amount;
                    } else {
                        oneUser.Credits = amount;

                    }
                    oneUser.save((err, doc) => {
                    if (err) {
                        callback(new Error(err.message, 500), null);
                    }
                    else {
                        res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
                        res.write(JSON.stringify(doc));
                        res.end();

                    }
                    });

                }

            });


    }


});



router.get('/:id', function (req, res, next) {
    let query;
        let userid = require('mongodb').ObjectID(req.params.id);
        let stateid = require('mongodb').ObjectID('58b1b6150c9a8fb863f7e93f');

        query = {state: {$ne: stateid},user: userid};

    async.series([
            function (callback) {
                OrderModel.find(query)
                    .populate('items')
                    .populate('items.item')
                    .populate('state')
                    .exec(callback);
            }
        ]
        , function (err, results) {
            res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
            res.write(JSON.stringify({Order: results[0]}));
            res.end();
        }
    );

});

router.get('/', function (req, res, next) {
    let id = req.params.id;
    //res.render('profile', { "title":"Профиль контакта"} );
    next();
});


module.exports = router;
