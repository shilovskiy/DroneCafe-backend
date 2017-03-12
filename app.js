var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./model/db');
const dburl = "mongodb://localhost:27017/DCDB";

db.mongoose.connect(dburl);

var index = require('./routes/index');
var user = require('./routes/showuser');
var order = require('./routes/orders');

var users = require('./routes/users');
var editusers = require('./routes/edituserdata');
var edittasks = require('./routes/edittaskdata');

var statistic = require('./routes/statistic');

var search = require('./routes/search');
var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Project Routes
app.use('/', index);
app.use('/showallusers', users);
app.use('/login', user);
app.use('/orders', order);

app.use('/edituserdata', editusers);
app.use('/edittaskdata', edittasks);

app.use('/newuser', editusers);
app.use('/search', search);

app.use('/statistic', statistic);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Страница не найдена');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.end();
    // res.render('error',{'message':err.message,'error':err});
});

db.mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dburl);
    var StateModel = require('./model/States');
    let states = ['New', 'InProgress', 'InDelivery', 'Problem', 'Ready'];

    for (let s of states) {
        StateModel.findOneAndUpdate({Name: s}, {Name: s}, {
            upsert: true,
            new: true
        }, function (err, numberAffected, raw) {
            console.log(err, numberAffected, raw);
        });

    }
});

module.exports = app;
