const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const File = require("../models/file");
const { getDownloadUrl, isSupabaseConfigured } = require("../services/supabaseService");
const axios = require("axios"); // Added for streaming from cloud to zip

router.get("/download/all/:uuid", async (req, res) => {
  try {
    const files = await File.find({ uuid: req.params.uuid });

    if (!files || !files.length) {
      return res.status(404).json({ message: "Payload bundle not found" });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });
    const isVercel = !!process.env.VERCEL;
    const uploadDir = isVercel ? "/tmp/uploads" : path.join(__dirname, "..", "uploads");

    res.attachment(`CyberVault_Bundle_${req.params.uuid.slice(0, 8)}.zip`);

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(res);

    for (const file of files) {
      if (file.storageSource === "supabase") {
        try {
          const url = await getDownloadUrl(file.filename);
          // Stream from Supabase into Archive
          const cloudResponse = await axios.get(url, { responseType: 'stream' });
          archive.append(cloudResponse.data, { name: file.originalName || file.filename });
        } catch (cloudErr) {
          console.error(`Failed to bundle cloud file ${file.filename}:`, cloudErr.message);
        }
      } else {
        const filePath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file.originalName || file.filename });
        }
      }
    }

    await archive.finalize();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get("/download/single/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        message: "File record not found",
      });
    }

    if (file.storageSource === "supabase") {
      const url = await getDownloadUrl(file.filename);
      return res.redirect(url);
    }

    const isVercel = !!process.env.VERCEL;
    const uploadDir = isVercel ? "/tmp/uploads" : path.join(__dirname, "..", "uploads");
    const filePath = path.join(uploadDir, file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Physical file missing from server node" });
    }

    return res.download(filePath, file.originalName || file.filename);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

router.get("/:uuid", async (req, res) => {
  try {
    const files = await File.find({ uuid: req.params.uuid });

    if (!files || !files.length) {
      return res.status(404).render("download", {
        error: "Payload bundle not found in registry",
        files: [],
        shareLink: null,
      });
    }

    return res.render("download", {
      error: null,
      files,
      shareLink: `/files/${req.params.uuid}`,
    });
  } catch (error) {
    return res.status(500).render("download", {
      error: error.message,
      files: [],
      shareLink: null,
    });
  }
});



module.exports = router;
