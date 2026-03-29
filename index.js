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

// Database connection middleware (connect once and reuse)
let connected = false;
app.use(async (req, res, next) => {
  if (!connected) {
    try {
      console.log("Lazy-connecting to database...");
      await connectDB();
      connected = true;
      console.log("Database connected successfully");
    } catch (err) {
      console.error("Database connection failed:", err.message);
      // We still call next() to let the app try to serve what it can,
      // or the individual route handles the missing DB error later.
    }
  }
  next();
});

// Basic route for initial health check
app.get("/health", (req, res) => res.json({ status: "ok", database: connected ? "connected" : "disconnected" }));

// Routes
app.use("/api/files", files);
app.use("/files", show);

// Export for Vercel
module.exports = app;

// Local development only
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server listening at :${PORT}`);
  });
}
