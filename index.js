const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const files = require("./routes/file.js");
const show = require("./routes/show.js");

require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home", {
    appBaseUrl: process.env.APP_BASE_URL || `http://localhost:${PORT}`,
  });
});

// Routes
app.use("/api/files", files);
app.use("/files", show);

// Database connection
connectDB()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err.message));

// Vercel compatibility: Only listen if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server listening at :${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
