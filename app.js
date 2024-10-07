const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')
const Sqlite = require('better-sqlite3') // sqlite database driver
const SqliteStore = require('better-sqlite3-session-store')(session) // helpsstore session in an sqlite database
const sessOptions = {
// set secret from environment variable used to encode the session cookie
  secret: 'shhhhhhh_this-is+SECret', // should be the same for cookie-parser
  name: 'session-id', // name of the session cookie default: connect.sid
  resave: false, // store session after every request
  saveUninitialized: false, // if true sets a cookie even if no session infois stored
  cookie: { httpOnly: false, maxAge: 1000 * 60 * 60 }, // cookie options - seecookie-parser docs
  unset: 'destroy', // instruction for stored session when unset
  store: new SqliteStore({ // a location to store session besides the memory
    client: new Sqlite('sessions.db', { verbose: console.log }),
    expired: { clear: true, intervalMs: 1000 * 60 * 15 }
  })
}

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const examplesRouter = require('./routes/examples')
const secureRouter = require('./routes/secure')
const stateRouter = require('./routes/state')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(cookieParser(sessOptions.secret))// should have the same secret as

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/bw', express.static(path.join(__dirname, '/node_modules/bootswatch/dist')))
app.use('/examples', examplesRouter)
app.use('/secure', secureRouter)
app.use('/state', stateRouter)
// configure session session options
app.use(session(sessOptions))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
