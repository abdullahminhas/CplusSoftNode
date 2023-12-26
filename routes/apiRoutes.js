// routes/apiRoutes.js

const express = require("express");
const router = express.Router();
const User = require("../models/mongoModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// Define routes and controllers
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { name, email, password, profile_image } = req.body;

    // Validate input fields
    if (!name || !email || !password || !profile_image) {
      return res.status(400).json({
        error: "Name, email, password, and profile_image are required",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Adjust the salt rounds as needed

    // Save the user to the database with the hashed password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      profile_image,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);

    // Customized error messages based on error type
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    } else if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Duplicate key error", details: error.keyValue });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/user/me", auth, async (req, res) => {
  try {
    // Access the user information from req.user (added by the auth middleware)
    const { _id } = req.user;

    if (!_id) {
      return res.status(401).json({ error: "No user logged in" });
    }

    // Fetch the user based on the user ID
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/user/me", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Fetch the user based on the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields
    Object.keys(updates).forEach((update) => {
      user[update] = updates[update];
    });

    // Save the updated user data
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/user/me", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch the user based on the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Assuming there's a MongoDB collection for users, replace 'users' with your actual collection name
    const delRecord = await User.deleteOne({ _id: userId });

    if (delRecord.deletedCount === 1) {
      res.json({
        message: "User deleted successfully",
      });
    } else {
      res.status(404).json({ error: "User not found in the collection" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
