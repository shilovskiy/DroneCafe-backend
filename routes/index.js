var express = require('express');
var router = express.Router();

var UserModel = require('../model/users');

var StateModel = require('../model/States');

var ItemModel = require('../model/items');
var async = require("async");
const perPage = 10;
/* GET home page. */
router.get('/:id?', function(req, res, next) {

    var page =req.query.page!=undefined?req.query.page:1;
    let id = require('mongodb').ObjectID(req.params.id);
    async.series([

        function (callback) { //0
            ItemModel.find({})
                //.populate('User')
                //.populate('State')
                //.limit(perPage)
                //.skip(perPage * (page-1))
                .sort('Rating')
                .exec(callback);
        },
        function (callback) {//1
            UserModel.findOne({"_id":id}).exec(callback);
        },
        // function (callback) {//2
        //     StateModel.find({}).exec(callback);
        // },
        function (callback) {//3
            ItemModel.count({}).exec(callback);
        },

        ]
        ,function(err,results){
            let pagination = Math.round(results[3]/perPage,0);
            //res.render('index', { "docs": results[0],"pageAmount":pagination, "userList":results[1], "stateList":results[2], "title":"ToDo"} );
            res.writeHead(200,'OK',{'Content-Type':'application/json'});
            // res.write(JSON.stringify({'items':results[0],'UserInfo':results[1]}));
            res.write(JSON.stringify({'items':results[0]}));
            //res.write(JSON.stringify(results[1]));
            res.end();
        }
    );

});

module.exports = router;
