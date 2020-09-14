var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');

var config = require('./config');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
const uploadRouter = require('./routes/uploadRouter');
const favouriteRouter = require('./routes/favouriteRouter');
var Dishes = require('./models/dishes'); // Didn't used this in Commit "Express REST API with MongoDB and Mongoose Part 1"

var app = express();
const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db) => {
  console.log("Connected  to server correctly");
}, err => {
  console.log(err);
});

// Redirect all URL to HTTPS port
app.all('*', (req, res, next) => {
  if(req.secure)
    return next();
  else
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321'));

app.use(passport.initialize()); // SignUP ar time a execute hoy(must) & it calls deserializeUser()

app.use('/', indexRouter); // This is a middleware also
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public'))); // This line enables me show all static html file

app.use('/dishes', dishRouter); // this line can handle both '/dishes' & '/dishes/34' endpoints
app.use('/promotions', promoRouter); // this line can handle both '/promotions' & '/promotions/34' endpoints
app.use('/leaders', leaderRouter); // this line can handle both '/leaders' & '/leaders/34' endpoints
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favouriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;