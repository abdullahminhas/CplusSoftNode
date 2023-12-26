const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");

const auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "No user logged in" });
  }

  try {
    // Verify and decode the token using the actual secret key
    const decoded = jwt.verify(token, secretKey);

    // Make the user information available in the request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = auth;
