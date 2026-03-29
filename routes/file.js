const router = require("express").Router();
const fs = require("fs/promises");
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");
const { isEmailConfigured, sendShareEmail } = require("../services/emailService");

const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? '/tmp/uploads' : path.join(process.cwd(), "uploads");
const fileSizeLimitBytes = 1000 * 1000 * 100;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!require('fs').existsSync(uploadDir)) {
        require('fs').mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: fileSizeLimitBytes },
}).array("myfiles", 10);

function getBaseUrl(req) {
  const configUrl = process.env.APP_BASE_URL;
  const requestUrl = `${req.protocol}://${req.get("host")}`;

  // If APP_BASE_URL is set and is NOT localhost, use it as the source of truth.
  // If it's missing or set to localhost, use the actual host from the request.
  if (configUrl && !configUrl.includes("localhost")) {
    return configUrl;
  }

  return requestUrl;
}

function formatBundlePayload(files, req, extras = {}) {
  const bundleUuid = files[0].uuid;
  const shareLink = `${getBaseUrl(req)}/files/${bundleUuid}`;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return {
    uuid: bundleUuid,
    file: shareLink,
    count: files.length,
    filenames: files.map(f => f.originalName || f.filename),
    size: totalSize,
    sender: files[0].sender || null,
    receiver: files[0].receiver || null,
    ...extras,
  };
}

async function sendShareEmailIfPossible(files, req) {
  const first = files[0];
  if (!first.receiver) {
    return { emailSent: false, emailReason: "receiver_missing" };
  }

  if (!isEmailConfigured()) {
    return { emailSent: false, emailReason: "email_not_configured" };
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const bundleDescriptor = files.length > 1 
    ? `${files.length} files (including ${files[0].originalName || files[0].filename})`
    : files[0].originalName || files[0].filename;

  try {
    await sendShareEmail({
      sender: first.sender,
      receiver: first.receiver,
      shareLink: `${getBaseUrl(req)}/files/${first.uuid}`,
      fileName: bundleDescriptor,
      fileSize: totalSize,
    });

    return { emailSent: true };
  } catch (error) {
    const authFailed =
      error.responseCode === 535 || /invalid login|authentication failed/i.test(error.message);
    const senderInvalid =
      /sender .* is not valid|validate your sender|authenticate your domain/i.test(error.message);

    return {
      emailSent: false,
      emailReason: senderInvalid
        ? "smtp_sender_invalid"
        : authFailed
          ? "smtp_auth_failed"
          : "email_send_failed",
      emailError: error.message,
    };
  }
}

router.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is healthy",
  });
});

router.get("/:uuid/meta", async (req, res) => {
  try {
    const files = await File.find({ uuid: req.params.uuid });

    if (!files || !files.length) {
      return res.status(404).json({
        message: "Payload bundle not found",
      });
    }

    return res.json(formatBundlePayload(files, req));
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      const statusCode = err.code === "LIMIT_FILE_SIZE" ? 400 : 500;
      return res.status(statusCode).json({
        error: err.message,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one file is required for transmission.",
      });
    }

    const sender = req.body.sender?.trim() || null;
    const receiver = req.body.receiver?.trim() || null;
    const bundleUuid = uuid4();

    try {
      const dbPromises = req.files.map(f => {
        const file = new File({
          originalName: f.originalname,
          filename: f.filename,
          uuid: bundleUuid,
          path: f.path,
          size: f.size,
          sender,
          receiver,
        });
        return file.save();
      });

      const savedFiles = await Promise.all(dbPromises);
      const emailStatus = await sendShareEmailIfPossible(savedFiles, req);

      return res.status(201).json(
        formatBundlePayload(savedFiles, req, {
          existing: false,
          ...emailStatus,
        })
      );
    } catch (error) {
      // Cleanup files if DB save fails
      for (const f of req.files) {
        await fs.unlink(f.path).catch(() => {});
      }

      return res.status(500).json({
        error: error.message,
      });
    }
  });
});


module.exports = router;
