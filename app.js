var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var mainRouter = require('./routes/main');
var apiRouter = require('./routes/api');
var moment = require('moment');
// var Excel = require('exceljs');
// var workbook = new Excel.Workbook();
// workbook.xlsx.readFile('./public/file/STAFFING_SCHEDULE_TEMPLATE.xlsx')//Change file name here or give file path
//   .then(function () {
//     var worksheet = workbook.getWorksheet('OPD STAFF');
//     // var i = 1;
//     // worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
//     //   r = worksheet.getRow(i).values;
//     //   r1 = r[2];// Indexing a column
//     //   i++;
//     // });

//     const column_array = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
//       "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF"];

//     const number_days_in_month = moment("2020-05", "YYYY-MM").daysInMonth();
//     const weekday_name = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//     const dt = moment("2020-05-01", "YYYY-MM-DD");
//     console.log(dt.format('dddd'));
//     const current_weekday = dt.format('dddd').substr(0, 3);

//     let index = weekday_name.indexOf(current_weekday);
//     worksheet.getCell("A8").value = "FOR THE MONTH OF " + (moment().format("MMMM YYYY")).toUpperCase();
//     for (let i = 0; i < number_days_in_month; i++) {
//       worksheet.getCell(column_array[i] + "12").value = weekday_name[index];
//       index = (index + 1) % weekday_name.length;
//     }

//     return workbook.xlsx.writeFile('./public/file/NEW_FILE.xlsx')//Change file name here or give     file path
//   });

var app = express();

app.use(session({
  secret: "nurse-scheduling",
  saveUninitialized: false,
  resave: false
}));

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use(function (req, res, next) {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/', mainRouter);
app.use('/api', apiRouter);

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

module.exports = app;
