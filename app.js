var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var cors = require('cors');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/', index);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status( err.code || 500 )
    .json({
      status: 'error',
      message: err
    });
  });
// }

// app.use(function(err, req, res, next) {
//   res.status(err.status || 500)
//   .json({
//     status: 'error',
//     message: err.message
//   });
// });

module.exports = app;
