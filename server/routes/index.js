require('dotenv').config()
var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require('../config');
const Users = require('../models/Users').Users;
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');

const readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, html);
    }
  });
};

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: config.smtp.USERNAME,
    pass: config.smtp.PASSWORD,
    clientId: config.smtp.OAUTH_CLIENT_ID,
    clientSecret: config.smtp.OAUTH_CLIENT_SECRET,
    refreshToken: config.smtp.OAUTH_REFRESH_TOKEN
  }
});
let mailOptions = {
  from: 'admin@cms.com',
  to: 'razaanis123@gmail.com',
  subject: 'Zepcom CMS App',
  text: ''
};

// Define the home page route
router.get('/', function (req, res) {
  res.status(200).json({ 'message': 'hello' });
});

function createUser(Users, email, name, password, isAdmin = false) {
  return new Promise((resolve, reject) => {
    let hash = bcrypt.hashSync(password, 12);
    Users.create({
      email: email,
      password: hash,
      name: name,
      isAdmin
    }).then((user) => {
      if (!user) {
        reject({ error: 'User not created' });
      } else {
        resolve(user);
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

//random string generator
function makePass(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.post('/register', async function (req, res) {
  let email = req.body.email;
  let name = req.body.name;
  let password = req.body.password;
  let password2 = req.body.password2;

  await Users.sync();

  if (password !== password2) {
    res.status(400).json({ 'message': 'Passwords do not match' });
  } else {
    Users.findOne({
      where: {
        email: email
      }
    }).then((user) => {
      if (user) {
        res.status(400).json({ 'message': 'Email already exists' });
      } else {
        createUser(Users, email, name, password, true).then((user) => {
          res.status(200).json({ 'message': 'User created', 'user': user });
        }).catch((err) => {
          res.status(500).json({ 'message': 'Server error', err });
        });
      }
    }).catch((err) => {
      res.status(500).json({ 'message': 'Server error', err });
    });
  }
});

router.post('/login-google', function (req, res) {
  console.log(req.body);
  let email = req.body.email
  let name = req.body.name

  Users.findOne({
    where: {
      email: email
    }
  }).then(async (user) => {
    if (!user) {
      let password = makePass(8);
      let user = await createUser(Users, email, name, password)

      const token = jwt.sign(
        { user_id: user._id, email, isAdmin: user.isAdmin },
        config.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      let loggedInUser = {
        name: user.name,
        token,
        isAdmin: user.isAdmin,
        email
      };

      res.status(200).json(loggedInUser);
    } else {
      if (!user) {
        res.status(401).json({ 'message': 'Password incorrect' });
      } else {
        const token = jwt.sign(
          { user_id: user._id, email },
          config.TOKEN_KEY,
          {
            expiresIn: "24h",
          }
        );

        let loggedInUser = {
          name: user.name,
          token,
          email,
          isAdmin: user.isAdmin,
        };

        res.status(200).json(loggedInUser);
      }
    }
  }).catch((err) => {
    res.status(500).json({ 'message': 'Server error', err });
  });
})


router.post('/login', function (req, res) {
  console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;
  Users.findOne({
    where: {
      email: email
    }
  }).then(async (user) => {
    if (!user) {
      res.status(401).json({ 'message': 'User not found' });
    } else {
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          console.log(err);
          res.status(500).json({ 'message': 'Internal server error' });
        } else if (!result) {
          res.status(401).json({ 'message': 'Password incorrect' });
        } else {
          const token = jwt.sign(
            { user_id: user._id, email, isAdmin: user.isAdmin },
            config.TOKEN_KEY,
            {
              expiresIn: "24h",
            }
          );

          let loggedInUser = {
            name: user.name,
            token,
            email,
            isAdmin: user.isAdmin,
          };

          res.status(200).json(loggedInUser);
        }
      });
    }
  }).catch((err) => {
    res.status(500).json({ 'message': 'Internal server error', err });
  });
});

router.post('/forgot-password', function (req, res) {
  let email = req.body.email;
  Users.findOne({
    where: {
      email: email
    }
  }).then(async (user) => {
    if (!user) {
      res.status(401).json({ 'message': 'User not found' });
    } else {
      let password = makePass(8);
      let hash = bcrypt.hashSync(password, 12);

      readHTMLFile(__dirname + '/pages/emailForgotPassword.html', function (err, html) {
        if (err) {
          console.log('error reading file', err);
          return;
        }
        const template = handlebars.compile(html);
        const replacements = {
          username: "John Doe",
          password: password
        };
        const htmlToSend = template(replacements);
        if (config.smtp.MAIL_TYPE === 'smtp') {

          mailOptions.html = htmlToSend;
          transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
              console.log(error);
            }
          });
        } else {
          // create a log file 
          const logFile = fs.createWriteStream('log.txt', { flags: 'a' });

          // write to log.txt
          logFile.write(htmlToSend);

        }
      });
      // send email with password and email template
    }
  }).catch((err) => {
    res.status(500).json({ 'message': 'Server error', err });
  });
});

router.use(auth);

module.exports = router;