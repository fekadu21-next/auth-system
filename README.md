# 🚀 SyncWrite — Real-Time Collaborative Document Editor

SyncWrite is a full-stack, real-time collaborative document editor inspired by Google Docs. It enables multiple users to edit documents simultaneously, manage versions, add comments, and collaborate seamlessly with live updates.

---

# 📌 Project Overview

SyncWrite is designed to demonstrate:

- Real-time collaboration using CRDTs (Yjs)
- Full-stack architecture (React + Node.js + MongoDB)
- Secure authentication and session management
- Scalable document editing system

It provides a WYSIWYG editing experience where what users see on screen exactly matches the exported PDF.

---

# 🎯 Project Goals

The goal of this project is to build a modern collaborative editor that supports:

- Multi-user editing in real time
- Role-based access (Viewer, Commenter, Editor)
- Version tracking and restoration
- Commenting system with threads and resolution
- Notifications and activity tracking

---

# 📦 Deliverables

✅ Full-stack working application  
✅ Real-time collaborative editor  
✅ Authentication system (Email + Google OAuth)  
✅ Document sharing and permissions  
✅ Version history and restore  
✅ Commenting system (add, reply, resolve, delete)  
✅ Notification system  
✅ Session and security management  
✅ Pagination + PDF export  
✅ Clean modular codebase  

---

# ✨ Features

## 📝 Document Editor

- Rich text editing using TipTap
- Tables, lists, and images
- Page-based layout (Letter format)
- Auto-save functionality
- PDF export

---

## ⚡ Real-Time Collaboration

- Live editing using Yjs (CRDT)
- Cursor tracking
- Typing indicators
- Conflict-free updates
- Multiple users editing simultaneously

---

## 👥 Sharing & Permissions

Users have different roles:

- **Viewer** → Read-only access
- **Commenter** → Can add comments
- **Editor** → Full editing access

---

# 💬 Comments System

Users can:

- Add comments
- Reply to comments using threads
- Resolve comments
- Delete their own comments

## 🔍 What Does "Resolve Comment" Mean?

Resolving a comment:

- Marks the issue as completed
- Keeps the comment in history
- Shows that the discussion has been addressed
- Can be hidden or visually marked as resolved

---

# 🕘 Version History

Features:

- Automatic version tracking
- Manual version naming
- Restore previous document versions
- Track document changes

---

# 🔔 Notifications

Real-time notifications for:

- Comments
- Mentions
- Document sharing
- Permission changes
- Role updates

---

# 🔐 Authentication & Security

Implemented security features:

- Email/password authentication
- Google OAuth login
- Password hashing using bcrypt
- Session management
- Device/session tracking
- Failed login protection

---

# 🏗️ System Architecture

```
Frontend (React + TipTap)
          |
          |
 REST API + Socket.IO
          |
          |
Backend (Node.js + Express)
          |
          |
MongoDB Database


Real-Time Collaboration:

TipTap Editor
      |
      |
     Yjs CRDT
      |
      |
  Socket.IO
      |
      |
 Backend Server
```

---

# 📁 Project Structure

```
syncwrite/

│
├── backend/
│
├── config/
├── models/
├── routes/
├── controllers/
├── services/
├── repositories/
└── sockets/

│
└── frontend/

    ├── components/
    ├── pages/
    ├── hooks/
    ├── utils/
    └── editor/
```

---

# ⚙️ Tech Stack

## 🔧 Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- Yjs (CRDT)
- Passport.js
- bcrypt
- express-session
- connect-mongo

---

## 🎨 Frontend

- React 19
- Vite
- Tailwind CSS
- TipTap Editor
- Socket.IO Client
- Yjs

---

# 🚀 Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/syncwrite.git

cd syncwrite
```

---

# 2️⃣ Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
MONGO_URI=your_mongodb_url

SESSION_SECRET=your_secret

GOOGLE_CLIENT_ID=your_google_id

GOOGLE_CLIENT_SECRET=your_google_secret
```

Run backend:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

# 3️⃣ Frontend Setup

Open frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🌐 Deployment

## Frontend

Deploy using:

- Vercel

Steps:

1. Push project to GitHub
2. Import frontend folder into Vercel
3. Configure environment variables
4. Set backend API URL

Recommended project name:

```
syncwrite
```

---

## Backend

Deploy using:

- Render
- Railway
- AWS
- DigitalOcean

Configure:

- MongoDB connection
- Session secret
- Google OAuth credentials

---

# 📄 PDF Export

PDF export uses:

- html2canvas
- jsPDF

Features:

- Maintains exact page layout
- Supports multi-page documents
- Preserves document formatting

---

# 📌 Pagination System

The editor supports:

- Fixed Letter page size
- 1-inch margins
- Automatic content flow
- Multi-page document handling

---

# 🔄 Backend Architecture Pattern

The backend follows a clean layered architecture:

```
Route
  |
Controller
  |
Service
  |
Repository
  |
Database
```

This improves:

- Maintainability
- Scalability
- Testing
- Code organization

---

# 👨‍💻 Author

Fekadu Asafew
