# 🏙️ Smart City AI Complaint Management

A full-stack civic complaint management system designed to help citizens report and manage civic issues through a secure web application.

## 📌 Project Overview

Smart City AI Complaint Management is a web-based application that allows users to register, log in securely, submit civic complaints, view their complaints, update or delete them, and track complaint status.

Administrators can access a separate dashboard to view all complaints and update their status.

The project is being developed in multiple phases, with AI-powered civic issue detection, NLP, RAG, automated notifications, and other intelligent features planned for later development stages.

## ✨ Current Features

### 👤 User Features

- User registration
- Secure user login
- JWT-based authentication
- View user profile
- Submit civic complaints
- View personal complaints
- View individual complaint details
- Update complaints
- Delete complaints
- Track complaint status
- Logout

### 👨‍💼 Admin Features

- Admin authentication
- Admin dashboard
- View all user complaints
- View complaint details
- Update complaint status
- Role-based access control
- Admin logout

### 🔐 Security

- Password hashing using bcrypt
- JWT authentication
- Role-based authorization
- Protected user APIs
- Protected admin APIs
- Input validation using Pydantic
- CORS configuration for frontend-backend communication

## 🛠️ Technologies Used

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT
- Passlib / bcrypt
- Uvicorn

### Frontend

- HTML
- CSS
- JavaScript

### Development Tools

- Visual Studio Code
- Swagger / OpenAPI
- Git
- GitHub

## 📁 Project Structure

```text
TCN Project/
│
├── README.md
│
├── backend/
│   ├── .env
│   ├── admin.py
│   ├── auth.py
│   ├── complaints.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   ├── test_db.py
│   └── venv/
│
└── frontend/
    ├── admin.html
    ├── admin.js
    ├── index.html
    ├── script.js
    └── style.css