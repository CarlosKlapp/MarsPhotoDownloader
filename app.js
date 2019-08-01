var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var dotenv = require('dotenv');

dotenv.config();

var indexRouter = require('./routes/index');
var marsRouter = require('./routes/mars');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/mars', marsRouter.router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

process.on("SIGINT", function () {
    //graceful shutdown
    marsRouter.writeManifestFromFile();
    process.exit();
});

marsRouter.readManifestFromFile(); // read asynchronously

// Catch the Ctrl+C on windows
// if (process.platform === "win32") {
//     var rl = require("readline").createInterface({
//         input: process.stdin,
//         output: process.stdout
//     });

//     rl.on("SIGINT", function () {
//         process.emit("SIGINT");
//     });
// }

module.exports = app;
