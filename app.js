var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var v0Router = require('./routes/API/v0');
var apiRouter = require('./routes/API/v1');
var charts = require('./routes/API/charts')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v0', v0Router);
app.use('/api/v1', apiRouter);
app.use('/charts',charts);

app.listen(process.env.PORT, () => console.log('Example app listening on port '+process.env.PORT))

module.exports = app;
