var express = require('express');

var headerType = 'application/json;charset=UTF-8';

var router = express.Router();

var UserModel = require('../model/users');
var StateModel = require('../model/States');
var ItemModel = require('../model/items');
var OrderModel = require('../model/orders');
var async = require("async");
const drone = require('netology-fake-drone-api');

// drone
//     .deliver()
//     .then(() => console.log('Доставлено'))
//     .catch(() => console.log('Возникли сложности'));


router.get('/:id?', function (req, res, next) {
    let query;
    if (req.params.id.toLowerCase() != "all") {
        let orderid = require('mongodb').ObjectID(req.params.id);
        query = {"_id": orderid};
    } else {
        query = {};//todo добавить новые и в прогрессе
    }

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
router.post('/CreateNewOrder', function (req, res, next) {

    if ((req.headers['content-type'] == 'application/json') && (req.headers['content-length'] !== "0")) {
        var itemsID = [];

        for (let itm of req.body['itemid']) {
            itemsID.push(require('mongodb').ObjectID(itm));
        }

        let orderid = require('mongodb').ObjectID(req.body['orderid']);


        var neworder = new OrderModel();
        neworder._id = orderid;
        neworder.title = "test order XXX";
        for (let itmid of itemsID) {
            neworder.items.push(itmid);
        }

        var query = {"_id": orderid};
        OrderModel.findOneAndUpdate(query, neworder, {upsert: true}, (err, doc) => {
            if (err) {
                return new Error(err.message, 500)
            }
            else {
                return "succesfully saved";
            }
        });

        /*
         neworder.save((err, reults) => {
         if (err) {
         console.log(err);
         //var err = new Error("Имя или Фамилия должны быть заполнены ОБЯЗАТЕЛЬНО!!!");
         //next(err);
         } else {
         console.log(`Inserted ${reults}`);
         //res.redirect(301,"/showallusers");
         }
         });
         */
        // if (req.body['additem'] === 'key') {
        //     res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
        //     res.write(JSON.stringify(req.body['additem']));
        //
        // } else {
        //
        //     res.writeHead(401, 'WWW-Authenticate', {'Content-Type': 'text/plain; charset=utf-8'});
        //     res.write(JSON.stringify(req.body));
        // }
        res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
        res.write('OK');
        res.end();

    }
    else {
        res.writeHead(404, 'not found', {'Content-Type': 'text/plain; charset=utf-8'});
        res.write('404 Not Found');
        let err = new Error("404 Not Found");
        next(err);
    }


// async.series([
//         function (callback) {
//             OrderModel.findOne({"_id":id})
//                 .populate('items')
//                 .exec(callback);
//         }
//     ]
//     ,function(err,results){
//         console.log(results[0]);
//     }
// );

});


router.post('/addItemToOrder', function (req, res, next) {
    console.log(req.headers['content-type']);
    if ((req.headers['content-type'] == headerType) && (req.headers['content-length'] !== "0")) {
        let itemID = require('mongodb').ObjectID(req.body.item._id);
        let orderid = require('mongodb').ObjectID(req.body.order._id);
        let query = {_id: orderid};
        let userid = 0;
        if (req.body.user != undefined) {
            userid = require('mongodb').ObjectID(req.body.user._id);
            query.user = userid;
        }

        async.auto({
            isOrderExist: function (callback) {
                OrderModel.find(query).limit(1).exec((err, orders) => {
                    callback(err, (orders.length > 0));
                });
            },
            orderStates: function (callback) {
                StateModel.find({})
                    .exec((err, allStates) => {
                        var states = {};
                        for (let state of allStates) {
                            states[state.Name] = state._id;
                            //states.push({Name:state.Name,_id:state._id});
                        }
                        callback(err, states);
                    });
            },
            // If two does not depend on one, then you can remove the 'one' string
            //   from the array and they will run asynchronously (good for "parallel" IO tasks)
            Order: ['isOrderExist', 'orderStates', function (orders, callback) {
                if (orders.isOrderExist) { //Order exist in DB
                    //AddToCurrent order
                    OrderModel.findOne(query)
                        .populate('state')
                        .populate('items')
                        .populate('items.item')
                        .exec((err, doc) => {
                            if (err) {
                                callback(new Error(err.message, 500), null);
                            }
                            else {

                                let item = {};
                                item.item = itemID;
                                item.amount = 1;
                                item.state = orders.orderStates.New;
                                let itmE = doc.items.push(item);

                                //let itmE = doc.items.addToSet(itemID);
                                console.log(itmE);

                                doc.save((err, doc) => {
                                    if (err) {
                                        callback(new Error(err.message, 500), null);
                                    }
                                    else {
                                        // doc.populate('state').populate('items', (err, pDoc) => {
                                        doc.populate('items').populate('items.item').populate('items.state', (err, pDoc) => {
                                            callback(err, pDoc.toObject({virtuals: true}));
                                        });

                                    }
                                });
                                //doc.save();
                                //callback(err,doc);
                            }
                        });
                }
                else {
                    //Create New Order
                    //console.log("Create New Order");

                    let neworder = new OrderModel();

                    neworder.title = "test order XXX";
                    neworder.state = orders.orderStates.New;
                    let item = {};
                    item.item = itemID;
                    item.amount = 1;
                    item.state = orders.orderStates.New;
                    neworder.items.push(item);

                    if (userid != 0) {
                        neworder.user = userid;
                    }
                    neworder.save((err, doc) => {
                        if (err) {
                            callback(new Error(err.message, 500), null);
                        }
                        else {
                            doc.populate('items').populate('items.item').populate('items.state', (err, pDoc) => {

                                callback(err, pDoc.toObject({virtuals: true}));
                            });

                        }
                    });
                }

            }],
            // Final depends on both 'one' and 'two' being completed and their results
            final: ['isOrderExist', 'Order', function (results, err) {
                // results is now equal to: {one: 1, two: 2}
                console.log(results);
                res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
                res.write(JSON.stringify(results));
                res.end();
            }]
        });


    }
    else {
        res.writeHead(404, 'not found', {'Content-Type': 'text/plain; charset=utf-8'});
        res.write('404 Not Found');
        let err = new Error("404 Not Found");
        next(err);
    }


});


router.post('/removeItemFromOrder', function (req, res, next) {

    if ((req.headers['content-type'] == headerType) && (req.headers['content-length'] !== "0")) {
        var itemID = require('mongodb').ObjectID(req.body.item._id);
        let orderid = require('mongodb').ObjectID(req.body.order._id);

        let query = {_id: orderid};
        let userid = 0;
        if (req.body.user != undefined) {
            userid = require('mongodb').ObjectID(req.body.user._id);
            query.user = userid;
        }

        async.auto({
            isOrderExist: function (callback) {
                OrderModel.find(query).limit(1).exec((err, orders) => {
                    callback(err, (orders.length > 0));
                });
            },
            orderStates: function (callback) {
                StateModel.find({})
                    .exec((err, allStates) => {
                        var states = {};
                        for (let state of allStates) {
                            states[state.Name] = state._id;
                        }
                        callback(err, states);
                    });
            },
            // If two does not depend on one, then you can remove the 'one' string
            //   from the array and they will run asynchronously (good for "parallel" IO tasks)
            Order: ['isOrderExist', 'orderStates', function (orders, callback) {
                if (orders.isOrderExist) {
                    //remove from current order

                    OrderModel.findOne(query)
                        .populate('state')
                        .populate('items')
                        .exec((err, doc) => {
                            if (err) {
                                callback(new Error(err.message, 500), null);
                            }
                            else {
                                var Rdoc = doc.items.remove(itemID);

                                doc.save((err, doc) => {
                                    if (err) {
                                        callback(new Error(err.message, 500), null);
                                    }
                                    else {

                                        doc.populate('items').populate('items.item').populate('items.state', (err, pDoc) => {
                                            callback(err, pDoc.toObject({virtuals: true}));
                                        });
                                    }
                                });


                            }
                        });

                }
                else {
                    //No Order No Meal ^)

                    let ErrorMessage = {_id: 0, errNo: 404, errMessage: 'Order not Found'};
                    callback(undefined, ErrorMessage);
                }

            }],
            // Final depends on both 'one' and 'two' being completed and their results
            final: ['isOrderExist', 'Order', function (results, err) {
                // results is now equal to: {one: 1, two: 2}
                console.log(results);
                res.writeHead(206, 'OK', {'Content-Type': 'application/json'});
                res.write(JSON.stringify(results));
                res.end();
            }]
        });

    }
    else {
        res.writeHead(404, 'not found', {'Content-Type': 'text/plain; charset=utf-8'});
        res.write('404 Not Found');
        let err = new Error("404 Not Found");
        next(err);
    }


});


//pullOrderToState
router.post('/pullOrderToState', function (req, res, next) {

    if ((req.headers['content-type'] == headerType) && (req.headers['content-length'] !== "0")) {
        //let itemID = require('mongodb').ObjectID(req.body.item._id);
        let orderid = require('mongodb').ObjectID(req.body.order._id);
        let userid = require('mongodb').ObjectID(req.body.user._id);
        let _state = req.body.state;

        var query = {_id: orderid, user: userid};

        async.auto({
            isOrderExist: function (callback) {
                OrderModel.find(query).limit(1).exec((err, orders) => {
                    callback(err, (orders.length > 0));
                });
            },
            orderStates: function (callback) {
                StateModel.find({})
                    .exec((err, allStates) => {
                        var states = {};
                        for (let state of allStates) {
                            states[state.Name] = state._id;
                            //states.push({Name:state.Name,_id:state._id});
                        }
                        callback(err, states);
                    });
            },
            // If two does not depend on one, then you can remove the 'one' string
            //   from the array and they will run asynchronously (good for "parallel" IO tasks)
            Order: ['isOrderExist', 'orderStates', function (orders, callback) {
                if (orders.isOrderExist) {
                    //AddToCurrent order
                    OrderModel.findOne(query)
                        .populate('state')
                        .populate('items')
                        .populate('items.item')
                        .populate('user')
                        .exec((err, doc) => {
                            if (err) {
                                callback(new Error(err.message, 500), null);
                            }
                            else {
                                doc.state = orders.orderStates[_state];

                                doc.save((err, doc) => {
                                    if (err) {
                                        callback(new Error(err.message, 500), null);
                                    }
                                    else {
                                        let cUser = doc.user;
                                        cUser.Credits = cUser.Credits - doc.toObject().TotalPrice;
                                        cUser.save();
                                        //doc.populate('items').populete('user').populate('items.item').populate('items.state', (err, pDoc) => {
                                        doc.populate('state').populate('items.state', (err, pDoc) => {
                                            callback(err, pDoc.toObject({virtuals: true}));
                                        });

                                    }
                                });


                                //doc.save();
                                //callback(err,doc);
                            }
                        });
                }
                else {
                    //Create New Order
                    //console.log("Create New Order");

                    let neworder = new OrderModel();

                    neworder.title = "test order XXX";
                    neworder.items.push(itemID);
                    neworder.state = orders.orderStates.New;
                    neworder.user = userid;
                    neworder.save((err, doc) => {
                        if (err) {
                            callback(new Error(err.message, 500), null);
                        }
                        else {
                            doc.populate('state').populate('items', (err, pDoc) => {

                                callback(err, pDoc.toObject({virtuals: true}));
                            });

                        }
                    });
                }

            }],
            // Final depends on both 'one' and 'two' being completed and their results
            final: ['isOrderExist', 'Order', function (results, err) {
                // results is now equal to: {one: 1, two: 2}
                console.log(results);

                if (_state=='InDelivery') {
                    drone.deliver()
                        .then(() => console.log('Доставлено'))
                        .catch(() => console.log('Возникли сложности'));
                }
                res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
                res.write(JSON.stringify(results));
                res.end();
            }]
        });


    }
    else {
        res.writeHead(404, 'not found', {'Content-Type': 'text/plain; charset=utf-8'});
        res.write('404 Not Found');
        let err = new Error("404 Not Found");
        next(err);
    }


});


//getCurrentUserNewOrder
router.post('/setCurrentUserToCurrentOrder', function (req, res, next) {

    if ((req.headers['content-type'] == headerType) && (req.headers['content-length'] !== "0")) {
        //let itemID = require('mongodb').ObjectID(req.body.item._id);
        let orderid = require('mongodb').ObjectID(req.body.order._id);
        let userid = require('mongodb').ObjectID(req.body.user._id);
        let _state = 'New';

        var query = {_id: orderid};

        async.auto({
            isOrderExist: function (callback) {
                OrderModel.find(query).limit(1).exec((err, orders) => {
                    callback(err, (orders.length > 0));
                });
            },
            orderStates: function (callback) {
                StateModel.find({})
                    .exec((err, allStates) => {
                        var states = {};
                        for (let state of allStates) {
                            states[state.Name] = state._id;
                            //states.push({Name:state.Name,_id:state._id});
                        }
                        callback(err, states);
                    });
            },
            // If two does not depend on one, then you can remove the 'one' string
            //   from the array and they will run asynchronously (good for "parallel" IO tasks)
            Order: ['isOrderExist', 'orderStates', function (orders, callback) {
                if (orders.isOrderExist) {
                    //AddToCurrent order
                    query.state = orders.orderStates.New; //todo Заменить на параметр state
                    OrderModel.findOne(query)
                        .populate('state')
                        .populate('items')
                        .exec((err, doc) => {
                            if (err) {
                                callback(new Error(err.message, 500), null);
                            }
                            else {
                                doc.user = userid;

                                doc.save((err, doc) => {
                                    if (err) {
                                        callback(new Error(err.message, 500), null);
                                    }
                                    else {
                                        doc.populate('user', '-Password', (err, pDoc) => {
                                            callback(err, pDoc.toObject({virtuals: true}));
                                        });

                                    }
                                });

                            }
                        });
                }
                else {
                    //order no exists. return Empty order
                    callback(undefined);


                }

            }],
            // Final depends on both 'one' and 'two' being completed and their results
            final: ['isOrderExist', 'Order', function (results, err) {
                console.log(results);
                res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
                res.write(JSON.stringify(results));
                res.end();
            }]
        });


    }
    else {
        res.writeHead(404, 'not found', {'Content-Type': 'text/plain; charset=utf-8'});
        res.write('404 Not Found');
        let err = new Error("404 Not Found");
        next(err);
    }


});
router.get('/', function (req, res, next) {
    let id = req.params.id;
    //res.render('profile', { "title":"Профиль контакта"} );
    next();
});

module.exports = router;
