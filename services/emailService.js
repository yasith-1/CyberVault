
const nodemailer = require("nodemailer");

function getEmailConfig() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT;
  const secure = process.env.SMTP_SECURE || process.env.EMAIL_SECURE || "false";
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
  };
}

function isEmailConfigured() {
  const config = getEmailConfig();

  return Boolean(
    config.host &&
      config.port &&
      config.user &&
      config.pass &&
      config.from
  );
}

function createTransporter() {
  const config = getEmailConfig();

  if (!isEmailConfigured()) {
    throw new Error("Email configuration is incomplete. Set SMTP_FROM to a verified Brevo sender.");
  }

  return nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: config.secure === "true",
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

async function sendShareEmail({ sender, receiver, shareLink, fileName, fileSize }) {
  const transporter = createTransporter();
  const { from } = getEmailConfig();
  const subject = `${sender || "Someone"} shared a file with you`;
  const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);

  const text = [
    `${sender || "Someone"} shared a file with you.`,
    "",
    `File: ${fileName}`,
    `Size: ${sizeMb} MB`,
    `Download: ${shareLink}`,
  ].join("\n");

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #f1f5f9; background-color: #020b07; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #040f09; border: 1px solid #0ea5e9; border-radius: 8px; overflow: hidden;">
        <div style="background-color: rgba(14, 165, 233, 0.1); padding: 20px; border-bottom: 1px solid #0ea5e9;">
          <h1 style="margin: 0; color: #0ea5e9; font-size: 24px; letter-spacing: 2px;">CYBERVAULT</h1>
          <p style="margin: 5px 0 0; color: #38bdf8; font-size: 12px; text-transform: uppercase;">// NODE_XFER_PROTOCOL_V2</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="margin: 0 0 15px; color: #ffffff; font-size: 18px;">File shared with you</h2>
          <p style="margin: 0 0 20px; color: #bae6fd;"><strong>${sender || "Someone"}</strong> has initiated a secure payload transfer to your address.</p>
          
          <div style="background-color: rgba(0,0,0,0.3); border: 1px dashed rgba(14,165,233,0.3); padding: 15px; margin-bottom: 30px; font-family: 'Courier New', Courier, monospace;">
            <div style="margin-bottom: 8px;"><span style="color: #38bdf8;">FILE:</span> <span style="color: #ffffff;">${fileName}</span></div>
            <div><span style="color: #38bdf8;">SIZE:</span> <span style="color: #ffffff;">${sizeMb} MB</span></div>
          </div>
          
          <div style="text-align: center;">
            <a href="${shareLink}" style="display: inline-block; background-color: #0ea5e9; color: #020b07; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Open download page</a>
          </div>
          
          <p style="margin: 30px 0 0; font-size: 12px; color: #38bdf8; opacity: 0.7;">// authenticated against node registry v2.1.0</p>
        </div>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from,
    to: receiver,
    cc: sender || undefined,
    subject,
    text,
    html,
  });
}

module.exports = {
  getEmailConfig,
  isEmailConfigured,
  sendShareEmail,
};
