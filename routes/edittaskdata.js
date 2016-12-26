/**
 * Created by Олег Шиловский on 13.12.2016.
 */
var express = require('express');
var router = express.Router();
var db = require('../model/db');
var TaskModel = require('../model/tasks');
var UserModel = require('../model/users');



router.get('/add', function(req, res, next) {

    let Task =new TaskModel();

    if (req.query.Information!=""){
        Task.Name = req.query.Information
    }
    if (req.query.Description!=""){
        Task.Description = req.query.Description
    }
    if (req.query.Deadline!=""){
        Task.Deadline = req.query.Deadline;
    }
    if (req.query.State!=""){
        Task.State = req.query.State
    }
    if (req.query.User!=""){
        Task.User = req.query.User
    }

    Task.save((err,reults)=> {
        if (err) {
            console.log(err);
            var err = new Error(`Произошла ошибка ${err}`);
            next(err);
        } else {
            console.log(`Inserted ${reults} contact with "_id" are: ${JSON.stringify(reults)}`);
            res.redirect(301,"/");
        }
    });

});


router.get('/save', function(req, res, next) {
    var id = require('mongodb').ObjectID(req.query.Id);
    var Information = req.query.Information;
    var Description = req.query.Description;
    var Deadline = req.query.Deadline;
    var State = req.query.State;
    var User = req.query.User;


    TaskModel.findOne({'_id':id},(err,doc)=>{
        doc.Name=Information;
        doc.Description = Description;
        doc.Deadline =Deadline;
        doc.State =State;
        doc.User =User;
        doc.save();
        res.redirect(301,"/");
    });


});




router.delete('/del', function(req, res, next) {
    for(let ids in req.body){
        let mongoID= require('mongodb').ObjectID(req.body[ids]);
        TaskModel.remove({_id:mongoID},
            (err)=> {
                if (err) {
                    console.log(err);
                    next(new Error(err.message));
                }
            }

        );

    }
    // res.redirect("/");
    res.writeHead(200,'OK',{'Content-Type':'application/json'});
    res.write(JSON.stringify('{result:OK}'));
    res.end();
    //res.send(200);

});



module.exports = router;
