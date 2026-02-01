# HR Buddy - Enterprise Employee Management System (EMS)

HR Buddy is a comprehensive, full-stack Employee Management System designed to streamline HR operations, employee data management, and payroll processing. Built with modern technologies, it offers a secure and responsive interface for Admins, HR Managers, and Employees.

## 🚀 Tech Stack

### Backend
- **Framework:** Spring Boot 3
- **Language:** Java 21
- **Security:** Spring Security & JWT (JSON Web Tokens)
- **Database:** MySQL (Hibernate / Spring Data JPA)
- **Build Tool:** Maven
- **API Documentation:** Swagger / OpenAPI

### Frontend
- **Library:** React 18
- **Build Tool:** Vite
- **Styling:** Bootstrap 5 & Custom CSS
- **State Management:** React Context API
- **HTTP Client:** Axios

### Deployment / Infrastructure
- **Backend Hosting:** Render
- **Frontend Hosting:** Vercel
- **Database:** Aiven MySQL (Cloud)

---

## ✨ Key Features

- **🔐 Secure Authentication**
  - Role-Based Access Control (RBAC) for Admin, HR, and Employee.
  - JWT-based stateless authentication.
  - Secure password hashing with BCrypt.

- **👤 User Management**
  - **Admin:** Full control over all users, departments, and system settings.
  - **HR:** Manage employee records, onboarding, and compliance.
  - **Employee:** View profile, salary slips, and update personal details.

- **📅 Leave Management**
  - Employees can apply for leaves with dates and reasons.
  - Leave balance tracking and status updates (Approved/Pending/Rejected).

- **💰 Payroll & Salary**
  - Automated salary slip generation.
  - Detailed breakdown of earnings and deductions.

- **📝 Resume Generation**
  - Integrated Python support for generating employee resumes dynamically.

---

## 🛠️ Setup & Installation

### Prerequisites
- Java 21 (JDK) installed.
- Node.js (v18+) & npm installed.
- MySQL Server running.

### 1. Clone the Repository
```bash
git clone https://github.com/ItsArshadmatin/HR_BUDDY-SPRINGBOOT-.git
cd HR_BUDDY-SPRINGBOOT-
```

### 2. Database Setup
Create a MySQL database named `ems` (or your preferred name).
```sql
CREATE DATABASE ems;
```

### 3. Backend Configuration
Navigate to `backend/src/main/resources/application.properties`.
It is recommended to use **Environment Variables** for sensitive data, but for local dev you can configure:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ems
spring.datasource.username=root
spring.datasource.password=your_password
# JWT Secret (Must be 32+ chars)
security.jwt.secret=your_super_secret_key_here
```

### 4. Run the Backend
```bash
cd backend
mvn spring-boot:run
```
The server will start on `http://localhost:8080`.

### 5. Frontend Configuration
Navigate to `frontend/`. Create a `.env` file:
```ini
VITE_API_BASE_URL=http://localhost:8080/api
```

### 6. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
The app will run on `http://localhost:5173`.

---

## 🔑 Environment Variables

For Production (Render/Vercel), ensure these variables are set:

**Backend (Render):**
| Variable | Description |
|----------|-------------|
| `DB_URL` | JDBC URL for MySQL (e.g., jdbc:mysql://host:port/db) |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing tokens |
| `GEMINI_API_KEY` | API Key for AI features (if enabled) |
| `FRONTEND_URL` | URL of the deployed frontend (e.g., https://myapp.vercel.app) |

**Frontend (Vercel):**
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | URL of the deployed backend (e.g., https://myapp.onrender.com/api) |

---

## 📚 API Documentation

Once the backend is running, you can access the full Swagger API documentation at:
`http://localhost:8080/swagger-ui.html`

---

## 👥 Authors

- **Arshad Matin** - *Project Lead & Developer*
