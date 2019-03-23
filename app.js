var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var seo = require('express-seo')(app);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

console.log("Building app...");
var app = express();
console.log("Express started...");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

// seo config

seo.setConfig({
  langs: ["en", "ro"]
});

seo.setDefaults({
  html: "<a href='https://github.com/toctavian/BitsOfBeats'>Project on github</a>", 
  title: "Bits of Beats", 
  description: {
      en: "Now there is a wasy to practice those fire lyrics without the need of paid samples. This AI generates pieces of beats, new with each generation, for free.",
      ro: "Acum ai sansa sa exersezi versurile alea blanao pe care le-ai pastrat pentru viitoarele productii. Inteligenta artificiala integrata in acest site it ofera beaturi noi la fiecare apasare de buton."
  },
  image: "public/images/seo-banner.png"
});

// app done

module.exports = app;

console.log("App built!");
let str = fs.readFileSync("public/images/txt/logo.txt",'utf8');

console.log(str);


