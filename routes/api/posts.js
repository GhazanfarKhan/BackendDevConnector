const express = require("express");
const router = express.Router();
const keys = require("../../config/keys");
const passport = require("passport");
const mongoose = require("mongoose");

// Load models

const Post = require("../../models/post");
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @route GET api/posts/test
// @desc Tests posts route
// @access Public
router.get("/test", (req, res) => {
  res.json({ message: "Posts works" });
});

// @route GET api/posts
// @desc Get posts
// @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(500).json({ nopostfound: "No post found" }));
});

// @route GET api/posts/:id
// @desc Get posts by id
// @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .sort({ date: -1 })
    .then(post => res.json(post))
    .catch(err => res.status(500).json({ nopostfound: "No post against id" }));
});

// @route DELETE api/posts/:id
// @desc delete posts by id
// @access Public
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (post.user.toString() !== req.user.id) {
              res.status(401).json({
                notauthorized: "User not authorize to delete this post"
              });
            }
            post
              .remove()
              .then(post => res.json({ success: true }))
              .catch(err => res.status(500).json(err));
          })
          .catch(err =>
            res.status(500).json({ nopostfound: "No post against id" })
          );
      })
      .catch(err =>
        res.status(500).json({ nopostfound: "No user profile found" })
      );
  }
);

// @route POST api/posts
// @desc Create Post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(500).json(err));
  }
);

// @route POST api/posts/like/:id
// @desc Like post
// @access Public
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res
                .status(400)
                .json({ alreadyliked: "User already liked the post" });
            }

            post.likes.unshift({ user: req.user.id });

            post.
              save().
              then(post => res.json(post));
          })
          .catch(err =>
            res.status(500).json({ nopostfound: "No post against id" })
          );
      })
      .catch(err =>
        res.status(500).json({ nopostfound: "No user profile found" })
      );
  }
);

// @route POST api/posts/unlike/:id
// @desc Like post
// @access Public
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              return res
                .status(400)
                .json({ notliked: "You haven't liked the post yet" });
            };

            const index = post.likes.findIndex(like => like.user.toString() === req.user.id)
            post.likes.splice(index, 1);

            post.
              save().
              then(post => res.json(post));
          })
          .catch(err =>
            res.status(500).json({ nopostfound: "No post against id" })
          );
      })
      .catch(err =>
        res.status(500).json({ nopostfound: "No user profile found" })
      );
  }
);

// @route POST api/posts/comment/:id
// @desc Create Post comment
// @access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        post.comments.unshift(newComment);
        post
          .save()
          .then(post => res.json(post))
          .catch(err => res.status(500).json(err));
      });
  });


// @route DELETE api/posts/comment/:id
// @desc Delete Post comment
// @access Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(comment => comment._id.toString() === req.params.comment_id)
            .length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexist: "Comment does not exist" });
        };

        const index = post.comments.findIndex(comment => comment._id.toString() === req.params.comment_id)
        post.comments.splice(index, 1);

        post.
          save().
          then(post => res.json(post));
      });
  });


module.exports = router;
