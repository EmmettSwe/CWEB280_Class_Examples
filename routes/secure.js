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
    isSubmitted: true,
    err: { email: 'Email it not recognized', pwd: 'Password is not recognized' } // Hard Coded FOR NOW
  })
})
