# 🎒 Campus Lost & Found Backend

A secure and scalable REST API for a college Lost & Found system that enables students to report lost or found items, submit ownership claims, receive notifications, and allows administrators to verify and approve claims.

Built using **Node.js, Express.js, MongoDB Atlas, JWT Authentication, Google OAuth, Cloudinary, and Swagger API Documentation.**

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Student Registration
- Email Verification
- Google OAuth Login
- JWT Authentication
- Role-Based Access Control (Student/Admin)

---

### 📦 Item Management

- Report Lost Item
- Report Found Item
- Upload Images using Cloudinary
- Update Item
- Delete Item
- Get Single Item
- Get All Items
- Search & Filters
- Pagination

---

### 🤝 Claim Workflow

- Submit Claim
- View My Claims
- Admin View Pending Claims
- Approve Claim
- Reject Claim
- Automatically Reject Other Pending Claims
- Prevent Users from Claiming Their Own Items

---

### 🎯 Matching Engine

Automatically suggests possible matches between Lost and Found items based on:

- Category
- Location
- Date Range (±7 Days)
- Title Similarity
- Match Score

---

### 🔔 Notifications

- Item Reported
- Claim Submitted
- Claim Approved
- Claim Rejected
- Mark Notification as Read
- Mark All Notifications as Read

---

### 📊 Dashboard APIs

#### Student Dashboard

- Reported Items
- Lost Items
- Found Items
- Active Claims
- Returned Items

#### Admin Dashboard

- Total Users
- Total Items
- Open Items
- Returned Items
- Pending Claims
- Today's Reports

---

### 🛡 Security

- JWT Authentication
- Helmet
- CORS
- Rate Limiting
- Input Validation using Express Validator

---

### 📄 API Documentation

Interactive Swagger Documentation

```
/api-docs
```

---

## 🛠 Tech Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas
- Mongoose

### Authentication

- JWT
- Google OAuth 2.0
- Passport.js

### File Upload

- Multer
- Cloudinary

### Email

- Nodemailer

### Documentation

- Swagger UI
- Swagger JSDoc

### Validation & Security

- Express Validator
- Helmet
- CORS
- Express Rate Limit

---

## 📁 Project Structure

```
server/
│
├── config/
├── controllers/
├── docs/
├── middleware/
├── models/
├── routes/
├── utils/
├── validators/
├── views/
│
├── server.js
└── package.json
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/Ash-kul47/campus-lost-found-backend.git
```

Go to project directory

```bash
cd campus-lost-found-backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file.

```env
MONGO_URI=

JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Run the server

```bash
npm run dev
```

---

## 📚 API Endpoints

### Authentication

```
POST /api/users/register
POST /api/users/login
GET  /api/users/profile
GET  /api/users/verify/:token
GET  /auth/google
GET  /auth/google/callback
```

---

### Items

```
POST   /api/items
GET    /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id
GET    /api/items/:id/matches
```

---

### Claims

```
POST /api/claims
GET  /api/claims/my
GET  /api/claims/pending
PUT  /api/claims/:id/approve
PUT  /api/claims/:id/reject
```

---

### Notifications

```
GET /api/notifications
PUT /api/notifications/read-all
PUT /api/notifications/:id/read
```

---

### Dashboard

```
GET /api/dashboard/student
GET /api/dashboard/admin
```

---

## 📖 API Documentation

Swagger Documentation

```
https://YOUR-RENDER-URL.onrender.com/api-docs
```

---

## 🌐 Deployment

Backend deployed using

- Render
- MongoDB Atlas
- Cloudinary

---

## 🚀 Future Enhancements

- React Frontend
- QR Code Verification
- AI-based Image Matching
- OCR for Documents
- Socket.IO Real-time Notifications
- Department-specific Admin Panels
- React Native Mobile App

---

## 👨‍💻 Developer

**Ashutosh Kulkarni**

Computer Engineering Student

Marathwada Mitra Mandal's College of Engineering, Pune

GitHub:
https://github.com/Ash-kul47
