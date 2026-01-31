# Project Mission: Enterprise Employee Management System (EMS)

## 1. Tech Stack & Architecture
* **Backend:** Java 21, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, Lombok.
* **Frontend:** React 19 (Vite), React-Bootstrap (Bootstrap 5), Bootstrap Icons.
* **Charts:** Chart.js (`react-chartjs-2`) for dashboard visualization.
* **Database:** MySQL 8 (Database name: `ems_db`).
* **Docs:** SpringDoc OpenAPI (Swagger UI).

## 2. Global "Gold Standard" Rules
* **Soft Delete:** Never physically delete an employee. Implement a boolean `isActive` column (default true). The "Delete" endpoint must sets `isActive = false`. All "Get" queries must filter by `WHERE isActive = true`.
* **Error Handling:** Create a `GlobalExceptionHandler` (`@ControllerAdvice`) to catch exceptions (e.g., "Insufficient Leave Balance") and return clean JSON: `{ "status": 400, "message": "Error text" }`.
* **Security:** Use `BCryptPasswordEncoder` for passwords.
* **Layout:** Use a **Vertical Sidebar** layout (Col-2 Left, Col-10 Right). The design must be clean, "Flat" corporate style.

## 3. Module Breakdown

### Module A: Authentication & RBAC
* Roles: `ADMIN`, `HR`, `EMPLOYEE`.
* **Security Logic:**
    * `EMPLOYEE`: Access to `/me`, `/leaves/apply`, `/payroll/view`.
    * `HR`: Access to `/dashboard`, `/employees/**`, `/leaves/manage`, `/ats`.
    * `ADMIN`: Full System Access.

### Module B: The Dashboard (Analytics)
* **Stats Cards (Top Row):** "Total Staff", "On Leave Today", "Pending Requests", "Est. Payroll Cost".
* **Visuals (Chart.js):**
    * **Department Distribution:** A Doughnut Chart showing staff count per department.
    * **Leave Trends:** A Bar Chart showing approved leaves per month (last 6 months).
* **Backend:** Create a `DashboardStatsDTO` and a custom JPQL query to fetch all these stats efficiently.

### Module C: Employee Management (HR Only)
* **Table:** Display Name, Department, Role, Status (Active/Inactive), Salary.
* **Features:**
    * **Search:** Filter table by Name or Department.
    * **Export:** Button to download the current table as `.csv`.
    * **Soft Delete:** Button to mark user inactive.

### Module D: Leave Engine
* **Logic:** Employee has a "Quota" (e.g., 20 days).
* **Validation:** Reject dates in the past. Reject if `requestedDays > balance`.
* **Workflow:** Employee applies -> HR sees "Pending" badge -> HR Approves/Rejects.

### Module E: Payroll & Razorpay
* **Formula:** `Net Pay = (Basic + HRA) - (Unpaid Leaves * Daily_Rate) - Tax`.
* **UI:** Show a breakdown of the calculation.
* **Action:** "Process Payment" button that opens a dummy **Razorpay** modal for simulation.

### Module F: AI ATS (Resume Checker)
* **Input:** Form to upload a PDF Resume.
* **Process:**
    1. Backend uses **Apache PDFBox** to extract text.
    2. Send text + "Software Engineer" Job Description to **Gemini 3 API**.
* **Output:** Display a "Match Score" (0-100) and "Missing Keywords" on the frontend.

## 4. Data Seeding (Crucial)
* Create a `DataSeeder.java` class that runs on application startup.
* It must populate the DB with:
    * 1 Admin User (`admin@ems.com` / `password`)
    * 1 HR User (`hr@ems.com` / `password`)
    * 15 Dummy Employees across 'IT', 'Sales', and 'HR' depts.
    * 10 Past Leave Requests (some approved, some rejected) so the charts have data to show.