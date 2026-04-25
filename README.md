# 🔐 AuthVault - Secure Authentication System

A modern, full-stack authentication system built with Express.js, JWT, and bcrypt. Features user registration, login, password hashing, and a secure dashboard.

## 🎯 Features

- ✅ **User Registration** with comprehensive validation
- ✅ **Secure Login** with bcrypt password hashing
- ✅ **JWT Authentication** with 7-day token expiry
- ✅ **Protected Routes** with middleware authentication
- ✅ **Session Management** using HTTP-only cookies
- ✅ **Dashboard** with user stats and account info
- ✅ **Input Validation** (frontend & backend)
- ✅ **Error Handling** with clear error messages
- ✅ **Security Headers** with Helmet.js
- ✅ **Rate Limiting** on auth endpoints
- ✅ **XSS Protection** with input sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

```bash
# Clone or download the project
cd login_setup

# Install dependencies
npm install

# Create and configure .env file
cp .env.example .env

# Start the server
npm start
```

Server will run at `http://localhost:3000`

## 📖 API Documentation

### Authentication Endpoints

#### 1. **Signup** - Create new account
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (201):
{
  "message": "Account created successfully!",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Validation:**
- Name: 2+ characters
- Email: valid email format
- Password: 6+ characters

#### 2. **Login** - Sign in to account
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "message": "Login successful!",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 3. **Get Current User** - Get logged-in user info (Protected)
```
GET /api/auth/me
Authorization: Cookie (auth_token)

Response (200):
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "login_count": 5,
    "last_login": "2026-04-24T23:30:00.000Z",
    "created_at": "2026-04-24T20:00:00.000Z"
  }
}
```

#### 4. **Dashboard Stats** - Get user statistics (Protected)
```
GET /api/dashboard/stats
Authorization: Cookie (auth_token)

Response (200):
{
  "stats": {
    "accountId": "#000001",
    "name": "John Doe",
    "email": "john@example.com",
    "memberSince": "April 24, 2026",
    "memberDays": "1 day",
    "loginCount": 5,
    "lastLogin": "Apr 24, 2026, 11:30 PM"
  }
}
```

#### 5. **Logout** - Sign out
```
POST /api/auth/logout
Authorization: Cookie (auth_token)

Response (200):
{
  "message": "Logged out successfully."
}
```

## 🔐 Security Features

### Implemented
- ✅ Password hashing with bcrypt (salt rounds: 12)
- ✅ JWT authentication (7-day expiry)
- ✅ HTTP-only cookies (prevents XSS)
- ✅ SameSite=Strict cookies
- ✅ CORS with credentials support
- ✅ Rate limiting on auth endpoints (100 req/15 min)
- ✅ General rate limiting (500 req/15 min)
- ✅ Security headers with Helmet
- ✅ Input sanitization (XSS protection)
- ✅ HTTPS cookie flag in production

### Recommended (Future)
- 🔲 Environment variable validation
- 🔲 CSRF protection tokens
- 🔲 Email verification
- 🔲 Password reset functionality
- 🔲 Account lockout after failed attempts
- 🔲 Audit logging
- 🔲 Two-factor authentication (2FA)

## 📁 Project Structure

```
login_setup/
├── server.js                 # Express server setup
├── package.json             # Dependencies
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
│
├── database/
│   ├── db.js               # Database connection
│   └── app.db.json         # User data (lowdb)
│
├── middleware/
│   └── authMiddleware.js    # JWT authentication
│
├── routes/
│   ├── auth.js             # Auth endpoints
│   └── dashboard.js        # Dashboard endpoints
│
├── public/
│   ├── index.html          # Home/redirect page
│   ├── login.html          # Login page
│   ├── signup.html         # Signup page
│   ├── dashboard.html      # User dashboard
│   ├── css/
│   │   └── styles.css      # Styling
│   └── js/
│       ├── auth.js         # Frontend auth logic
│       └── dashboard.js    # Dashboard logic
│
├── test-api.js             # API tests
└── REVIEW.md               # Code review & improvements
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secret-key-here

# Server
NODE_ENV=development
PORT=3000

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
SECURE_COOKIES=false

# Database
DB_PATH=./database/app.db.json
```

## 🧪 Testing

### Run API Tests
```bash
npm run test-api
```

### Run Comprehensive Tests
```bash
npm run test-comprehensive
```

## 📊 Database Schema

### Users Table
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "password_hash": "$2a$12$...",
      "login_count": 5,
      "last_login": "2026-04-24T23:30:00.000Z",
      "created_at": "2026-04-24T20:00:00.000Z"
    }
  ]
}
```

## 🚨 Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK** - Successful request
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Authentication required/failed
- **409 Conflict** - Email already registered
- **500 Internal Server Error** - Server error

## 🎨 Frontend Features

- **Modern UI** with gradient backgrounds
- **Responsive Design** (mobile-friendly)
- **Form Validation** with real-time feedback
- **Password Strength Meter** on signup
- **Password Visibility Toggle**
- **Skeleton Loaders** for better UX
- **Error Alerts** with clear messages
- **Loading States** on form submission

## 📱 Pages

1. **index.html** - Redirect to login/dashboard based on session
2. **login.html** - Login form with email & password
3. **signup.html** - Registration form with name, email, password
4. **dashboard.html** - Protected user dashboard with stats

## 🔄 Deployment Checklist

- [ ] Set strong `JWT_SECRET` in production
- [ ] Set `NODE_ENV=production`
- [ ] Enable `SECURE_COOKIES=true`
- [ ] Use environment variables for all secrets
- [ ] Setup HTTPS/SSL certificate
- [ ] Configure proper CORS origin
- [ ] Setup database backup strategy
- [ ] Enable monitoring & logging
- [ ] Setup CI/CD pipeline
- [ ] Add automated tests
- [ ] Setup rate limiting appropriately

## 📝 Future Improvements

### Phase 1 (Critical)
- Add email verification
- Add password reset functionality
- Add change password endpoint
- Add account deletion

### Phase 2 (Important)
- Add remember me functionality
- Add account lockout protection
- Add audit logging
- Add 2FA support

### Phase 3 (Nice to Have)
- Switch to PostgreSQL for production
- Add API documentation (Swagger)
- Add automated tests (Jest)
- Add analytics
- Add email notifications

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Express.js, JWT, and bcrypt**
