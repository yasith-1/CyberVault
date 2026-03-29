# 🛡️ CyberVault — Secure File Sharing

[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![EJS](https://img.shields.io/badge/EJS-5-B4CA65?logo=ejs&logoColor=white)](https://ejs.co/)

> A streamlined, secure file sharing application designed to effortlessly upload, manage, and share documents with ease. Featuring automated email delivery, unique downloadable links, and robust cloud-database integration.

---

## 📸 Overview

**CyberVault** is more than just a file locker; it's a dedicated platform for swift document exchange. Built with a robust Node.js and Express backend, it provides a seamless user experience for transferring files securely via email or direct links with a minimal footprint.

---

## ✨ Key Features

- 💎 **Secure File Uploads** — Robust handling of multipart file uploads directly to your server using **Multer**.
- ✉️ **Automated Notifications** — Integrated with **Nodemailer** for instant email delivery of file links natively to recipients.
- 🔗 **Unique Shareable Links** — Generates secure, unique UUID-based download links for effortlessly accessing uploaded files.
- 🌓 **Dynamic Interface** — Clean, server-rendered views built with **EJS** for straightforward uploading and downloading.
- 🏋️ **Cloud Database** — Stores file metadata and references reliably using **Mongoose** and **MongoDB**.
- 📱 **RESTful Architecture** — Well-structured API routes cleanly separating file management, email handling, and view rendering.

---

## 🛠️ The Tech Stack

| Technology | Role |
| :--- | :--- |
| **Node.js** | Runtime Environment |
| **Express 5** | Web Framework |
| **MongoDB / Mongoose 9** | Database ODM |
| **EJS 5** | Template Engine |
| **Multer** | File Upload Handling |
| **Nodemailer** | Serverless SMTP Communication |
| **UUID** | Unique Identifier Generation |

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/bipanshukr/file-sharing.git
cd CYBERVAULT
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your application and SMTP credentials:
```env
MONGO_URL=mongodb://127.0.0.1:27017/file-sharing
PORT=3000
APP_BASE_URL=http://localhost:3000

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-smtp-login-email
SMTP_PASS=your-brevo-smtp-key
SMTP_FROM=File Sharing <verified-sender@yourdomain.com>
```

### 4. Ignite the Development Server
```bash
npm run dev
```

---

## 📁 Architecture Overview

```text
CyberVault/
├── config/               # Database initialization and connection
├── controllers/          # Business logic for routes
├── models/               # Mongoose database schemas (file.js)
├── routes/               # Express API and view execution paths
├── services/             # Third-party service integrations (Nodemailer/SMTP)
├── uploads/              # Local storage sink for uploaded files
├── views/                # EJS templates for front-end rendering
├── index.js              # Application orchestrator
└── package.json          # Dependencies & Scripts
```

---

## 🏗️ Deployment

The project is optimized for rapid deployment and high-performance hosting on platforms like Render, Railway, or Heroku.

```bash
# Production Start
npm run server
```

---

**Developed with Passion by [Yashith Prabhashwara](https://github.com/bipanshukr)**  
*Elevating secure file sharing standards one byte at a time.*

