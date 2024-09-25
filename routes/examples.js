/**
 * examples.js
 * router for path  http://localhost:3000/examples
 * @type {e | (() => Express)}
 */

const express = require('express')
const router = express.Router()
const multer = require('multer')
const uploader = multer(
  {
    dest: 'public/uploads/',
    fileFilter: (req, file, callback) => {
      // add a filter to the mime type so only image files will be accepted
      if (file.mimetype.startsWith('image/')) {
        callback(null, true) // null means no error message, true means allowed
      } else {
        // make new error with message, and false means not allowed
        return callback(new Error('Only images are allowed'), false)
      }
    },
    limits: {
      fileSize: 2 * 1024 * 1024 // 2mB MAX FILE SIZE
    }
  })
// access to the file system

const fs = require('fs')
// eslint-disable-next-line no-unused-vars

// include code from express validator package
const { body, query, validation, validationResult } = require('express-validator')
// Create a formatter to clean up the validation result data in a way that makes it easier to display to the user
const onlyMsgErrorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return msg // we only want the message from All the params being sent in to the formatter
}

/* CONFIG MULTER to use public/uploads as the temporary file directory */
// also declare a variable for our middle ware function

/* GET content for path https://localhost:3000/examples/ */
router.get('/', (req, res) => {
  res.send(`<html>
<head><title>Examples Index</title><link rel="stylesheet" type="text/css" href="/bw/vapor/bootstrap.css"></head>
<body class="container"><h1>Examples Index</h1><ul><li><a href="/examples/simple-code/">Simple Server Code</a></li><li><a href="/examples/form?email=wieler5156@saskpolytech.ca&agreed=yes">Filled in form</a></li></ul></body>
</html>`)
})

/* GET Handler for http://localhost:3000/examples/simple-code/ */
router.get('/simple-code', (req, res) => {
  const rnd = Math.floor(Math.random() * 500)
  res.render('simple-code', {
    title: 'About Me',
    myPosition: 'Student',
    myName: 'V',
    randomNum: rnd,
    randomIsEven: rnd % 2 === 0,
    names: ['Steve', 'Tony', 'Bruce', 'Clark', 'Peter'],
    // add random information about the person using object notation
    person: { name: 'bob', age: 30 }
  })
})

/* GET handler to actually DISPLAY the form http://localhost:3000/examples/form */
router.get('/form', (req, res) => {
  // req.query contains all the URL query strings parsed into object form
  console.log(req.query)
  res.render('form-example', {
    title: 'GET - Form Example',
    isSubmitted: req.query.agreed === 'yes', // There are other ways to check if a form is submitted
    submittedEmail: req.query.email,
    submittedPassword: req.query.pwd, // pwd is the name="pwd" we set in the input tag
    submittedAgreed: req.query.agreed
  })
})

/* POST handler to process the submitted data AND re-display the form */
router.post('/form',
  // Express validator middleware - CAN move this elsewhere and save to a const variable
  [body('agreed').equals('yes').withMessage('you must agree to the terms and conditions'),
    body('email').trim().notEmpty().withMessage('An email is required').bail()
      .normalizeEmail().isEmail().withMessage('Email must be valid'),
    body('pwd').isLength({ min: 8, max: 25 }).withMessage('Password must be at least 8 to 25 characters').bail().isStrongPassword({ minSymbols: 0 }).withMessage('Password must contain uppercase lowercase and numbers'),
    body('Phone').if(body('Phone').notEmpty()).trim().isMobilePhone('en-CA').withMessage('Phone number must be a canadian phone number (000)-000-0000')],

  // the begining of our ananomouse function aka  OUR CODE
  (req, res) => {
  // req.body - contains all the formdata strings parsed into object form
    console.log('Request Body')
    console.log(req.body) // optional - for debugging

    const violations = validationResult(req)
    console.log('Validation Results Violations')
    console.log(violations)

    // take the ugly violations onj and clean it up for display
    const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped()

    console.log(errorMessages)

    res.render('form-example', {
      title: 'POST - Form Example',
      isSubmitted: req.body.agreed === 'yes', // There are other ways to check if a form is submitted
      submittedEmail: req.body.email,
      submittedPassword: req.body.pwd, // pwd is the name="pwd" we set in the input tag
      submittedAgreed: req.body.agreed,
      submittedPhone: req.body.Phone,
      err: errorMessages
    })
  })

/* GET Handler for http://localhost:3000/examples/upload */
router.get('/upload', (req, res) => {
  res.render('upload-files', { title: 'GET -Upload Files' })
})

router.post('/upload', uploader.fields([{ name: 'file1', maxCount: 2 }, { name: 'file2', maxCount: 1 }]),
  [// validation
    body('title1').trim().if((value, { req }) => req.files.file1)
      .notEmpty().withMessage('Title is required when uploading a file'),
    body('desc1').trim().if((value, { req }) => !req.files.file1)
      .isEmpty().withMessage('Description requires a file to be uploaded'),
    body('file1').custom((value, { req }) => {
      // check that file1 exists and is at leat 1KB
      if (req.files.file1 && req.files.file1[0].size < 1024) {
        throw new Error('Uploaded file must be at least 1KB in size')
      }
      // check if title is specified when no file is uploaded
      if (!req.files.file1 && req.body.title1.trim().length) {
        throw new Error('File is required when specifying a title')
      }
      return true // Indicates the success of this synchronous custom validator
    }),
    body('title2').trim().if((value, { req }) => req.files.file2)
      .notEmpty().withMessage('Title is required when uploading a file'),
    body('desc2').trim().if((value, { req }) => !req.files.file2)
      .isEmpty().withMessage('Description requires a file to be uploaded'),
    body('file2').custom((value, { req }) => {
      // check that file2 exists and is at leat 2KB
      if (req.files.file2 && req.files.file2[0].size < 1024) {
        throw new Error('Uploaded file must be at least 1KB in size')
      }
      // check if title is specified when no file is uploaded
      if (!req.files.file2 && req.body.title2.trim().length) {
        throw new Error('File is required when specifying a title')
      }
      return true // Indicates the success of this synchronous custom validator
    })
  ],
  (req, res) => {
    const file1 = req.files.file1?.[0] ?? { orginalname: 'Not Uploaded' }
    const file2 = req.files.file2 ? req.files.file2[0] : { orginalname: 'Not Uploaded' }
    console.log(file1)
    const violations = validationResult(req)
    // OPTIONAL: inspect the violations in the terminal
    console.log('Violations:')
    console.log(violations)
    const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped()

    const file1Sec = req.files.file1?.[0] ?? { orginalname: 'Not Uploaded' }
    // File handling
    // find the temporary location of the file and move them to our preferred directory
    const images = []

    // eslint-disable-next-line n/no-path-concat
    for (const [fileInputName, fileInfoArray] of Object.entries(req.files)) {
      for (const tempFileInfo of fileInfoArray) {
        moveFile(tempFileInfo, `${__dirname}/../public/images/`)
        /* Now that we have validation - we need to ensure that any fields that
correspond to file fields
ie( file1, title1, file2, title2, pictures) do not have
errors/violations. If a field does have an
error then we should remove/delete the corresponding uploaded file from
the server
if the field does not have an error then move the files as normal to the
images folder
*/
        // if the is an error message for the file's fieldname
        if (tempFileInfo.fieldname in errorMessages
        ) {
          // Delete temporary uploaded file if there is an error in the filed name
          fs.unlink(tempFileInfo.path, (err) => {
            if (err) throw err
            console.log('File removed at ' + tempFileInfo.path)
          })
        } else {
          // call the move file function to move the file to public/images folder
          moveFile(tempFileInfo, __dirname + '/../public/images/')
        }

        tempFileInfo.displayPath = '/images/' + tempFileInfo.filename + '-' + tempFileInfo.orginalname
        images.push('/images/' + tempFileInfo.filename + '-' + tempFileInfo.originalname)
      }
    }

    console.log(req.files)
    res.render('upload-files', {
      title: 'POST -Upload Files',
      bodyData: req.body,
      file1Info: file1,
      file2Info: file2,
      file1Sec,
      images,
      err: errorMessages
    })
  })
function moveFile (tempfileInfo, newPath) {
  newPath += tempfileInfo.filename + '-' + tempfileInfo.originalname
  fs.rename(tempfileInfo.path, newPath, (err) => {
    if (err) {
      console.error(err)
    }
  })
}
module.exports = router
