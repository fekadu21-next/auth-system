🚀 SyncWrite — Real-Time Collaborative Document Editor

SyncWrite is a full-stack, real-time collaborative document editor inspired by Google Docs. It enables multiple users to edit documents simultaneously, manage versions, add comments, and collaborate seamlessly with live updates.

📌 Project Overview

SyncWrite is designed to demonstrate:

Real-time collaboration using CRDTs (Yjs)
Full-stack architecture (React + Node.js + MongoDB)
Secure authentication and session management
Scalable document editing system

It provides a WYSIWYG editing experience where what users see on screen exactly matches the exported PDF.

🎯 Proposal

The goal of this project is to build a modern collaborative editor that supports:

Multi-user editing in real time
Role-based access (viewer, commenter, editor)
Version tracking and restoration
Commenting system with threads and resolution
Notifications and activity tracking
📦 Deliverables
✅ Full-stack working application
✅ Real-time collaborative editor
✅ Authentication system (Email + Google OAuth)
✅ Document sharing & permissions
✅ Version history & restore
✅ Commenting system (add, reply, resolve, delete)
✅ Notification system
✅ Session & security management
✅ Pagination + PDF export
✅ Clean, modular codebase
✨ Features
📝 Document Editor
Rich text editing (TipTap)
Tables, lists, images
Page-based layout (Letter format)
Auto-save functionality
PDF export
⚡ Real-Time Collaboration
Live editing using Yjs (CRDT)
Cursor tracking
Typing indicators
Conflict-free updates
👥 Sharing & Permissions
Viewer → read only
Commenter → add comments
Editor → full edit access
💬 Comments System

Users can:

Add comments
Reply to comments (threaded)
Resolve comments
Delete their own comments
🔍 What “Resolve Comment” Means
Marks a comment as completed
Keeps it in history (not deleted)
Indicates the issue is addressed
Often hidden or visually marked as resolved
🕘 Version History
Automatic version tracking
Manual version naming
Restore previous versions
🔔 Notifications
Real-time updates for:
Comments
Mentions
Shares
Role changes
🔐 Authentication & Security
Email/password login (bcrypt)
Google OAuth login
Session management
Device/session tracking
Failed login protection
🏗️ Architecture
Frontend (React + TipTap)
   ↓ REST API + Socket.IO
Backend (Node.js + Express)
   ↓
MongoDB (Database)
Real-Time Engine
TipTap Editor ⇄ Yjs CRDT ⇄ Socket.IO ⇄ Backend
📁 Project Structure
syncwrite/
│
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   └── sockets/
│
└── frontend/
    ├── components/
    ├── pages/
    ├── hooks/
    ├── utils/
    └── editor/
⚙️ Tech Stack
🔧 Backend
Node.js
Express.js
MongoDB + Mongoose
Socket.IO
Yjs (CRDT)
Passport.js
bcrypt
express-session + connect-mongo
🎨 Frontend
React 19
Vite
Tailwind CSS
TipTap Editor
Socket.IO Client
Yjs
🚀 Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/your-username/syncwrite.git
cd syncwrite
2️⃣ Backend Setup
cd backend
npm install

Create .env file:

MONGO_URI=your_mongodb_url
SESSION_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

Run backend:

npm run dev

Backend runs on:

http://localhost:5000
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
🌐 Deployment
Frontend (Vercel)
Recommended name: syncwrite
Deploy via:
Push to GitHub
Import into Vercel
Set API URL to backend
Backend

Deploy on:

Render / Railway / AWS / DigitalOcean
📄 PDF Export
Uses html2canvas + jsPDF
Maintains exact page layout
Supports multi-page export
📌 Pagination System
Fixed page size (Letter)
1-inch margins
Content automatically flows to next page
🔄 Backend Architecture Pattern
Route → Controller → Service → Repository
