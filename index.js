const express = require("express");
const apiRoutes = require("./routes/apiRoutes");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 5000;

app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/NewDb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set the limit for the request body size
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

app.use("/", express.static(path.join(__dirname, "public/images")));
app.use("/", apiRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
