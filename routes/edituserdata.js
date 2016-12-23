/**
 * Created by Олег Шиловский on 13.12.2016.
 */
var express = require('express');
var router = express.Router();
var db = require('../model/db');
var UserModel = require('../model/users');

/* GET users profile. */



router.get('/add', function(req, res, next) {
    let docs=[{Name:'',LName:'',Email:'',Phone:'',Skype:''}];

    res.render('profile', { 'docs': docs[0],'title':'Адресная книга','nextaction':'/edituserdata/save'} );//'docs': null,
});


router.get('/save', function(req, res, next) {
    let Cntct =new UserModel();
    let OtherContacts= {};
    if (req.query.Name!=""){
        Cntct.Name = req.query.Name
    }
    if (req.query.LName!=""){
        Cntct.LName = req.query.LName
    }
    if (req.query.Phone!=""){
        Cntct.Phone = req.query.Phone
    }
    if (req.query.Email!=""){
        Cntct.Email = req.query.Email
    }
    if (req.query.Skype!=""){
        Cntct.Skype = req.query.Skype
    }

    Cntct.save((err,reults)=> {
        if (err) {
            console.log(err);
            var err = new Error("Имя или Фамилия должны быть заполнены ОБЯЗАТЕЛЬНО!!!");
            next(err);
        } else {
            console.log(`Inserted ${reults} contact with "_id" are: ${JSON.stringify(reults)}`);
        }
    });

});


router.get('/:id', function(req, res, next) {
    let id = require('mongodb').ObjectID(req.params.id);
    let Name = req.query.Name;
    let LName = req.query.LName;
    let Email = req.query.Email;
    let Phone = req.query.Phone;
    let Skype = req.query.Skype;


    UserModel.findOne({'_id':id},(err,doc)=>{
        doc.Name=Name;
        doc.LName = LName;
        doc.Email =Email;
        doc.Phone =Phone;
        doc.Skype =Skype;
        doc.save();
        res.redirect(301,"/showallusers");
    });


});




router.delete('/del', function(req, res, next) {
    for(let ids in req.body){
        let mongoID= require('mongodb').ObjectID(req.body[ids]);
        UserModel.remove({_id:mongoID},
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
