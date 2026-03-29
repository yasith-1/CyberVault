const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const connectDB = require("./config/db");
const files = require("./routes/file.js");
const show = require("./routes/show.js");

require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const configUrl = process.env.APP_BASE_URL;
  const requestUrl = `${req.protocol}://${req.get("host")}`;
  
  res.render("home", {
    appBaseUrl: (configUrl && !configUrl.includes("localhost")) ? configUrl : requestUrl,
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
      return res.status(500).json({ 
        error: "Database configuration error. Please check MONGO_URL.",
        details: err.message 
      });
    }
  }
  next();
});

// Basic route for initial health check
app.get("/health", (req, res) => {
  const dbName = connected ? mongoose.connection.name : "N/A";
  const dbHost = connected ? (mongoose.connection.host || "unknown") : "N/A";
  res.json({ 
    status: "ok", 
    database: connected ? "connected" : "disconnected",
    dbName: dbName,
    dbHost: dbHost
  });
});

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
