var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

require('./lib/connectMongoose');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/anuncios', require('./routes/api/v1/anuncios'));
app.use('/api/v1/tags', require('./routes/api/v1/tags'));

app.use('/', require('./routes/index'));
app.use('/tags', require('./routes/tags'));
app.use('/users', require('./routes/users'));

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    if (err.array) {
        err.status = 422;
        const errInfo = err.array({ onlyFirstError: true })[0];
        err.message = isAPIRequest(req) ? { message: 'Not valid', errors: err.mapped() } :
            `El parámetro ${errInfo.param} ${errInfo.msg}`;
    }

    res.status(err.status || 500);

    if (isAPIRequest(req)) {
        res.json({ error: err.message });
        return;
    }

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.render('error');
});

function isAPIRequest(req) {

    return req.originalUrl.startsWith('/api/');
}

module.exports = app;