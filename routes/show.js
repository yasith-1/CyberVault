const router = require("express").Router();
const path = require("path");
const File = require("../models/file");

router.get("/download/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.status(404).json({
        message: "File record not found",
      });
    }

    // Reconstruct the path relative to the current project directory.
    // This is more robust than using an absolute path stored in the database,
    // which might point to a path from a previous environment (e.g., Vercel's /tmp).
    const isVercel = !!process.env.VERCEL;
    const uploadDir = isVercel ? "/tmp/uploads" : path.join(__dirname, "..", "uploads");
    const filePath = path.join(uploadDir, file.filename);

    return res.download(filePath, file.originalName || file.filename);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.status(404).render("download", {
        error: "File record not found in registry",
        file: null,
        downloadLink: null,
        shareLink: null,
      });
    }

    return res.render("download", {
      error: null,
      file,
      downloadLink: `/files/download/${file.uuid}`,
      shareLink: `/files/${file.uuid}`,
    });
  } catch (error) {
    return res.status(500).render("download", {
      error: error.message,
      file: null,
      downloadLink: null,
      shareLink: null,
    });
  }
});


module.exports = router;
