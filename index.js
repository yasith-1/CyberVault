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

// Basic route for initial health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/files", files);
app.use("/files", show);

// Database connection
console.log("Attempting database connection...");
connectDB()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("CRITICAL: Database connection failed during startup!");
    console.error("Error Detail:", err.message);
    // On Vercel, we can't kill the process gracefully, but we should log it clearly.
  });

// Vercel compatibility
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server listening at :${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
