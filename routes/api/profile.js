const express = require('express');
const router = express.Router();
const keys = require('../../config/keys');
const passport = require('passport');
const mongoose = require('mongoose');

// Load models

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// Validation 
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');



// @route GET api/profile/test
// @desc Tests profile route
// @access Public
router.get('/test', (req, res) => {
  res.json({ message: "Profile works" });
});

// @route GET api/profile/all
// @desc Get all profiles
// @access Public
router.get('/all', (req, res) => {
  const errors = {};
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.profile = "There are no profiles";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(500).json(err));
});

// @route GET api/profile/handle/:handle
// @desc Get profile by handle
// @access Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(500).json(err));
});


// @route GET api/profile/user/:user_id
// @desc Get profile by handle
// @access Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.profile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(500).json(err));
});


// @route GET api/profile
// @desc Get current user profile 
// @access Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  Profile.findOne(req.user.id)
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.profile = "Profile not found";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(500).json(err));
});


// @route POST api/profile
// @desc Update current user profile 
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.handle = req.body.handle;
    if (req.body.website) profileFields.handle = req.body.handle;
    if (req.body.location) profileFields.handle = req.body.handle;
    if (req.body.bio) profileFields.handle = req.body.handle;
    if (req.body.status) profileFields.handle = req.body.handle;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    if (typeof req.body.skills != 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne(req.user.id)
      .then(profile => {
        if (profile) {
          //Update
          Profile.findOneAndUpdate(
            { user: profileFields.user },
            { $set: profileFields },
            { new: true }
          ).then(profile => res.json(profile))
            .catch(err => res.status(500).json(err));
        }
        else {
          Profile.findOne({ handle: profileFields.handle })
            .then(profile => {
              if (profile) {
                errors.profile = "Profile handle already exists";
                res.status(400).json(errors);
              }
              new Profile(profileFields)
                .save()
                .then(profile => res.json(profile))
                .catch(err => res.status(500).json(err));
            }).catch(err => res.status(500).json(err));
        }
      })
      .catch(err => res.status(500).json(err));
  });


// @route POST api/profile/experience
// @desc Add experience to profile
// @access Private

router.post('/experience', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.profile = "No profile found";
          res.status(404).json(errors);
        }
        const newExperience = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        //Add to experience
        profile.experience.unshift(newExperience);
        // Save
        Profile.save(profile)
          .then(profile => res.json(profile))
          .catch(err => res.status(500).json(err))
      });
  });

// @route POST api/profile/education
// @desc Add education to profile
// @access Private

router.post('/education', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.profile = "No profile found";
          res.status(404).json(errors);
        }
        const newEducation = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        //Add to experience
        profile.education.unshift(newEducation);
        // Save
        Profile.save(profile)
          .then(profile => res.json(profile))
          .catch(err => res.status(500).json(err))
      });
  });


// @route DELETE api/profile/education/:edu_id
// @desc Delete education from profile
// @access Private

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }),
  (req, res) => {

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.profile = "No profile found";
          res.status(404).json(errors);
        }
        const index = profile.education.findIndex(edu => edu.id === edu_id);
        //Add to experience
        profile.education.splice(index, 1);
        // Save
        Profile.save(profile)
          .then(profile => res.json(profile))
          .catch(err => res.status(500).json(err))
      });
  });


// @route DELETE api/profile/experience/:exp_id
// @desc Delete experience from profile
// @access Private

router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }),
  (req, res) => {

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.profile = "No profile found";
          res.status(404).json(errors);
        }
        const index = profile.experience.findIndex(edu => edu.id === exp_id);
        //Add to experience
        profile.experience.splice(index, 1);
        // Save
        Profile.save(profile)
          .then(profile => res.json(profile))
          .catch(err => res.status(500).json(err))
      });
  });


// @route DELETE api/profile
// @desc Delete user profile
// @access Private

router.delete('/', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // remove user profile
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        // remove user
        User.findOneAndRemove({ _id: req.user.id })
          .then(profile => res.json({ success: true }))
          .catch(err => res.status(500).json(err))
      });
  });

module.exports = router;