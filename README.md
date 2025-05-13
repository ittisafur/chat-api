# Chat API Backend

<p align="center">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
</p>

## 📚 Overview

A powerful, secure REST API that provides real-time messaging capabilities with user and admin roles. Built with Express.js, TypeScript, and WebSockets for real-time communication.

## ✨ Features

### 🔐 Role-Based Access Control

- User and Admin role separation
- Different API endpoints for each role

### 🔒 Authentication & Security

- JWT authentication
- Email verification
- Server-side validation (Zod)
- Rate limiting for all endpoints

### 💬 Real-Time Messaging

- Direct user-to-user messaging
- Group chat functionality
- WebSockets for instant communication

### 📄 Comprehensive Documentation

- Swagger UI for both user and admin APIs

### 🧾 Advanced Logging

- Winston logger with daily rotation
- Detailed error tracking

## 🏗️ Architecture

src/
├── config/ # Configuration files
├── controllers/ # Request handlers
│ ├── admin/ # Admin controllers
│ ├── auth/ # Authentication controllers
│ └── user/ # User controllers
├── middleware/ # Custom middleware
├── prisma/ # Database schema and seeding
├── routes/ # API routes
├── services/ # Business logic
├── socket/ # WebSocket handlers
├── types/ # Type definitions
├── utils/ # Utility functions
├── app.ts # Express application setup
└── server.ts # Server entry point

## 🛠️ Technology Stack

- **Core**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, bcrypt
- **Validation**: Zod
- **Real-time**: Socket.IO
- **Documentation**: Swagger UI
- **Logging**: Winston with daily rotation
- **Rate Limiting**: express-rate-limit
- **Email**: Brevo API

## 🔄 API Documentation

- **User API**: `/api/docs/user`
- **Admin API**: `/api/docs/admin`

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chat-api.git
cd chat-api
npm install
```

### 2. Set up environment variables

NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/chat_api_db?schema=public"
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"
BREVO_API_KEY="your-brevo-api-key"
EMAIL_FROM="noreply@yourdomain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="StrongPassword123!"
CORS_ORIGINS="http://localhost:3000,https://your-frontend-url.com"

### 3. Set up the database

```js
// Generate Prisma client
npx prisma generate

// Run migrations
npx prisma migrate dev

// Seed the database with default admin
npx prisma db seed
```

### 4. Start the development server

```bash
npm run dev

```

## 🌐 Deployment

The API is deployed on Railway. To deploy your own instance:

Sign up for Railway

Connect your GitHub repository

Add a PostgreSQL database

Set up the required environment variables

Deploy the application

## 🔒 Security Considerations

All passwords are hashed using bcrypt

JWT tokens for secure authentication

Rate limiting to prevent abuse

CORS configuration to restrict access

Server-side validation for all inputs using Zod
