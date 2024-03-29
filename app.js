var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const config = require('./config');
//connect mongoose
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/db_bwamern_staycation');
mongoose.connect('mongodb+srv://pidorkartawiria:ZSk304F5rbI681Lv@cluster0.ya6jcts.mongodb.net/db_staycation?retryWrites=true&w=majority',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true, // This is often recommended to avoid deprecation warning for collection.ensureIndex
  useFindAndModify: false // To use findOneAndUpdate() instead of findAndModify()
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// admin router
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

var app = express();

const store = new MongoDBStore({
  uri: 'mongodb+srv://pidorkartawiria:ZSk304F5rbI681Lv@cluster0.ya6jcts.mongodb.net/db_staycation?retryWrites=true&w=majority',
  collection: 'sessions',
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'))
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  // cookie: { maxAge: 60000 },
  store: store
}))
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/sb-admin-2', express.static(path.join(__dirname, 'node_modules/startbootstrap-sb-admin-2')))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/api/v1', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.get('/', (req, res) => {
  // Use the base URL from the configuration file
  const baseUrl = process.env.NODE_ENV === 'production' ? config.production.baseUrl : config.development.baseUrl;

  // Pass the base URL to your view
  res.render('index', { baseUrl });
});

// Add headers before the routes are defined
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'origin-list');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
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
