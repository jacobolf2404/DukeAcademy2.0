DukeAcademy 2.0 — Milestone 3
==============================

Team Members:
  - Jacobo Lopez Fernandez (jl1331@duke.edu)
  - Shepard Seinfeld (ss1556@duke.edu)

Repository: https://github.com/jacobolf2404/DukeAcademy2.0.git

Demo Video Link: [INSERT VIDEO LINK HERE]

-------------------------------
SETUP & RUNNING
-------------------------------

Prerequisites: Docker and Docker Compose

  1. Clone the repository:
     git clone https://github.com/jacobolf2404/DukeAcademy2.0.git
     cd DukeAcademy2.0

  2. Start all services:
     docker compose up --build

  3. Seed the database (first run only):
     docker compose exec backend python seed.py

  4. Open the app:
     Frontend: http://localhost:5173
     Backend API: http://localhost:5001/api

  5. Test accounts:
     admin@duke.edu    / admin123
     teacher@duke.edu  / teacher123
     student@duke.edu  / student123

-------------------------------
IMPLEMENTATION LOCATIONS
-------------------------------

JACOBO LOPEZ FERNANDEZ — Authentication, Courses, and Assignments APIs:

  Backend:
    - Auth endpoints (register, login, logout, me):
        backend/app/routes/auth.py (lines 9-55)
    - Course endpoints (list, create, get, update, delete):
        backend/app/routes/courses.py (all)
    - Assignment endpoints (list, create, update, delete):
        backend/app/routes/assignments.py (all)

  Frontend:
    - Login/Register page: frontend/src/pages/LoginPage.jsx
    - Course catalog with create form: frontend/src/pages/CoursesPage.jsx
    - Navbar with Duke branding: frontend/src/components/Navbar.jsx
    - App router and auth state: frontend/src/App.jsx

  Models:
    - User model: backend/app/models/user.py
    - Course model: backend/app/models/course.py
    - Assignment model: backend/app/models/assignment.py

SHEPARD SEINFELD — Enrollments, Submissions, and Grading APIs:

  Backend:
    - Enrollment endpoints (enroll, drop, roster, my-courses):
        backend/app/routes/enrollments.py (all)
    - Submission endpoints (submit, list submissions, grade, my-grades, course stats):
        backend/app/routes/submissions.py (all)

  Frontend:
    - Course detail page with enrollment, submission modal, grading modal,
      roster tab, and statistics tab:
        frontend/src/pages/CourseDetailPage.jsx
    - My Courses dashboard: frontend/src/pages/MyCoursesPage.jsx
    - Grades transcript page with stats: frontend/src/pages/GradesPage.jsx

  Models:
    - Enrollment model: backend/app/models/enrollment.py
    - Submission model: backend/app/models/submission.py

Shared:
    - API client (all Axios methods): frontend/src/api.js
    - Global CSS styles: frontend/src/styles/global.css
    - Database schema: db/init.sql
    - Database seeder: backend/seed.py
    - Docker configuration: docker-compose.yml

-------------------------------
TECHNOLOGY STACK
-------------------------------
  Backend:  Python 3.11, Flask, SQLAlchemy ORM, Flask-Login, bcrypt
  Frontend: React 18, Vite, React Router, Axios
  Database: PostgreSQL 16
  Deploy:   Docker & Docker Compose

-------------------------------
DATABASE TABLES
-------------------------------
  1. users        — id, name, email, hashed_password, role, created_at
  2. courses      — id, title, description, teacher_id (FK), created_at
  3. enrollments  — student_id (FK), course_id (FK), enrolled_at [composite PK]
  4. assignments  — id, course_id (FK), title, description, due_date, max_points, created_at
  5. submissions  — id, assignment_id (FK), student_id (FK), content, submitted_at, grade, feedback
