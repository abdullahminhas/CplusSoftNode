// models/mongoModel.js

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { secretKey } = require("../config");

// Define the schema for your data
const userSchema = new mongoose.Schema({
  profile_image: String,
  name: String,
  email: String,
  password: String,
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate a JWT token for user authentication
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, secretKey);
};

// Create a model using the schema
const User = mongoose.model("User", userSchema);

// Export the model
module.exports = User;
