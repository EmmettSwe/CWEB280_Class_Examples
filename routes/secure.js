/**
 * secure.js
 * router for the secure / path examples
 *
 *
 */

const express = require('express')
const router = express.Router()
const fs = require('fs')
const jwt = require('jsonwebtoken')
const secret = 'I Love Beer'

/* GET handler for login http://localhost:3000/secure/ */

router.get('/', function (req, res) {
  res.render('secure-login', {
    title: 'Get Login Form',
    submittedEmail: 'admin@t.ca', // Hard Coded FOR NOW
    submittedPassword: '123456Pw' // Hard Coded FOR NOW
  })
})

/* POST handler for LOGIN */
router.post('/', function (req, res) {
  res.render('secure-login', {
    title: 'Get Login Form',
    submittedEmail: req.body.email, // Hard Coded FOR NOW
    submittedPassword: req.body.pwd, // Hard Coded FOR NOW
    submittedData: req.body.data,
    isSubmitted: true,
    err: { email: 'Email it not recognized', pwd: 'Password is not recognized' } // Hard Coded FOR NOW
  })
})

/* Get handler for three paths - DASHBOARD, PROFILE, BOOKING */
router.get(['/dashboard', '/profile', '/booking'], function (req, res) {
  // determine which page the user is trying to access from the url path
  const scope = req.path.replace(/^\/+|\/+$/g, '')

  res.render('secure-generic', {
    title: scope.toUpperCase(),
    action: req.baseUrl + req.path // determine form submit from url and path
  })
})

/* POST handler for all 3 generic paths */
router.post(['/dashboard', '/profile', '/booking'], function (req, res) {
  // determine which page the user is trying to access from the url path
  const scope = req.path.replace(/^\/+|\/+$/g, '')

  res.render('secure-generic', {
    title: 'POST' + scope.toUpperCase()
    // no action I will this as a boolean to determine wether or not to display the form on the page

  })
})
module.exports = router
