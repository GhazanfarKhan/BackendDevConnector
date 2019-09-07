const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// validations
const valdateRegisterInput = require('../../validation/register');
const valdateLoginInput = require('../../validation/login');


// Load User model
const User = require('../../models/User');

// @route GET api/users/test
// @desc Tests post route
// @access Public
router.get('/test', (req, res) => {
  res.json({ message: "User works" });
});

// @route POST api/users/register
// @desc Register User
// @access Public
router.post('/register', (req, res) => {
  const { errors, isValid } = valdateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = 'Email already exists';
        return res.status(400).json(errors);
      }
      const avatar = gravatar.url(req.body.email, {
        s: '200', //Size,
        r: 'pg', // Rating
        d: 'mm'  // Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (error, hash) => {
          if (error) throw error;
          newUser.password = hash;
          newUser.save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      })
    })
});


// @route POST api/users/login
// @desc Validate user and return JWT token
// @access Public
router.post('/login', (req, res) => {
  const { errors, isValid } = valdateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = req.body;
  console.log(req.body);
  // Find user by email
  User.findOne({ email })
    .then(user => {
      // Check for user
      if (!user) {
        errors.email = 'User not found';
        return res.status(404).json(errors);
      }
      // Check Password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            errors.password = "Invalid Password";
            return res.status(400).json(errors);
          }

          // User found
          const payload = { id: user.id, name: user.name, avatar: user.avatar };

          //JWT token
          jwt.sign(payload, keys.secret, { expiresIn: 3600 }, (err, token) => {
            return res.json({
              success: true,
              token: 'Bearer ' + token
            });
          });
        });

    });
});


// @route POST api/users/current
// @desc Current User 
// @access Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
});

module.exports = router;