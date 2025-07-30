# authAsAService
## 📘 ASAS Authentication Service

A secure, scalable authentication service built with Node.js, Express, MySQL, and JWT. It handles user registration, login, email verification, password reset, and token-based authentication using cookies.

---

### 🚀 Features

* ✅ User Registration & Login
* ✅ Email Verification (JWT-based)
* ✅ Refresh Token Rotation (HTTP-only Cookies)
* ✅ Password Reset via Email
* ✅ Secure Logout (token revocation + cookie clearing)
* ✅ Role-based Access Middleware
* ✅ Swagger API Documentation
* ✅ CORS & Rate Limiting Security
* ✅ Environment Variable Management
* ✅ Unit & Integration Test Ready (Jest + Supertest)

---

### ⚙️ Tech Stack

* **Backend:** Node.js + Express
* **Database:** MySQL
* **Auth:** JWT (Access & Refresh Tokens)
* **Email:** Nodemailer
* **Docs:** Swagger
* **Testing:** Jest & Supertest

---

### 📦 Installation

```bash
git clone https://github.com/YanisRekane/authAsAService.git
cd authAsAService
npm install
cp .env.example .env
# Configure DB, mail, JWT in .env
npm run dev
```
---

📚 Dependencies

express

mysql2

jsonwebtoken

cookie-parser

cors

express-rate-limit

dotenv

nodemailer

bcryptjs

swagger-jsdoc

swagger-ui-express

Dev/Test: jest, supertest
---

### 🔐 Environment Variables

Set the following in your `.env` file:

```
DB_HOST=youdbhost
DB_USER=yourdbuser
DB_PASS=yourdbpassword
DB_NAME=yourdbname
JWT_SECRET=yourjwtsecret
REFRESH_TOKEN_SECRET=yourrefrechtokensecret
EMAIL_SECRET=youremailtokensecret
EMAIL_USERNAME=youremailaddress
EMAIL_PASSWORD=yourgeneratedemailpass
CLIENT_URL=http://localhost:3000
```

---

### 📖 API Documentation

Visit:
`http://localhost:5000/api-docs`

All routes are documented using Swagger.

---

### 🧪 Testing

```bash
npm test
```

> Includes test cases for all core auth flows.

---

### 🧱 Project Structure

```
.
├── controllers/
├── routes/
├── middleware/
├── middleware/
├── config/
├── swagger.js
├── tests/
└── app.js
```

---

### 🧰 Available Scripts

* `node app.js` – Start dev server 
* `npm test` – Run tests
* `npm run swagger-autogen` – (Optional) If using autogen for Swagger

---

### ⚠️ Future Improvements

*

---

### 📬 Contact

Built with ❤️ by **\RekaneYanis**
Feel free to reach out: `yanis.fullstack@email.com`
