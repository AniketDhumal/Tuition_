# 📚 E-Learning Management System (Full-Stack)
<p align="center">
  <a href="https://tuition-1-xx17.onrender.com/" target="_blank"><b>🔥 Live Demo</b></a>
</p>

A complete **E-learning & Course Management System** built with **Node.js, Express, MongoDB, and Vanilla JS (HTML/CSS/JS frontend)**.  
It supports user & admin roles, course management, resource sharing, results tracking, analytics, and dashboards with charts.

---

## 🚀 Features

### 👨‍🎓 Student
- Register/Login with JWT authentication  
- View & enroll in courses  
- Access learning resources (PDF, video, links, docs, etc.)  
- View grades, GPA & CGPA calculation  
- Manage personal profile (bio, image, skills)  
- Student dashboard with charts  

### 👩‍🏫 Teacher / Admin
- Manage courses (CRUD + approval system)  
- Manage results (manual entry or bulk CSV import)  
- Upload & manage learning resources  
- Monitor analytics (course popularity, grade distribution, downloads, etc.)  
- Admin dashboard with recent activity logs  

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Chart.js, Three.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB + Mongoose ODM  
- **Authentication:** JWT (JSON Web Tokens), bcrypt.js  
- **File Uploads:** Multer, Custom file services  
- **Error Handling:** Centralized error middleware (`AppError`, `ErrorResponse`)  
- **Utilities:** `apiFeatures.js` for filtering/sorting/pagination  

---

## 📂 Project Structure

```
project-root/
├── frontend/
│   ├── templates
│   ├── css
    └── package.json
    └── package-lock.json
│   └── js/
│       ├── index.js
│       ├── login.js
│       ├── register.js
│       ├── dashboard.js
│       ├── resources.js
│       └── ...
     
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repo
```bash
git clone https://github.com/AniketDhumal/Tuition.git
cd e-learning-system
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables  
Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/elearning
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
```

### 4️⃣ Run the server
```bash
npm run dev
```

Server will run at: `http://localhost:5000`

### 5️⃣ Run the frontend
You can simply open the `frontend/` HTML files in your browser, or use **Live Server** in VS Code:
```bash
# If you have Python installed
python -m http.server 3000
```
Now open: `http://localhost:3000`

---

## 🌐 API Overview

### 🔑 Auth
- `POST /api/v1/auth/register` → Register new user  
- `POST /api/v1/auth/login` → Login  
- `GET /api/v1/auth/me` → Get current user  
- `PUT /api/v1/auth/updatedetails` → Update profile details  
- `PUT /api/v1/auth/updatepassword` → Update password  

### 📚 Courses
- `GET /api/v1/courses` → List all courses  
- `POST /api/v1/courses` → Create course (admin/teacher)  
- `GET /api/v1/courses/:id` → Get course details  

### 📝 Results
- `POST /api/v1/results` → Create result (admin/teacher)  
- `POST /api/v1/results/import` → Import results from CSV  
- `GET /api/v1/results/student/:studentId` → Student results + GPA  

### 📂 Resources
- `POST /api/v1/resources/upload` → Upload resource file  
- `GET /api/v1/resources` → Get all resources (with pagination/search)  
- `GET /api/v1/resources/:id/view` → View resource details  

### 👤 Profile
- `GET /api/v1/profile/me` → Get logged-in user profile  
- `PUT /api/v1/profile` → Update profile info  
- `POST /api/v1/profile/image` → Upload profile picture  

### 📊 Admin
- `GET /api/v1/admin/stats` → System statistics  
- `GET /api/v1/admin/activities` → Recent activity logs  

---

## 📊 System Architecture



- **Frontend** → Sends requests via fetch() to API endpoints  
- **Routes** → Define REST API paths (`/api/v1/...`)  
- **Controllers** → Contain business logic for resources, courses, results, etc.  
- **Models** → Define MongoDB schemas (User, Course, Resource, Result, etc.)  
- **Database** → MongoDB stores persistent data  

---

## 📌 Future Improvements
- Migrate frontend to React/Next.js  
- Add notifications system  
- Integrate payment gateway for premium courses  
- Add real-time chat (Socket.IO)  

---

## 🤝 Contributing
Pull requests are welcome! Please open an issue first to discuss what you’d like to change.

---
