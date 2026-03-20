# DukeAcademy 2.0 — Milestone 3 Demo Script
## Video Demo (~2.5 minutes)

---

### INTRO (Jacobo — 10 seconds)

> "Hi, we're Jacobo and Shepard, and this is DukeAcademy 2.0 — a full-stack course management platform built with Flask, React, and PostgreSQL. Let me start by showing the APIs I implemented."

---

### PART 1: JACOBO'S APIs — Authentication + Course Management (~60 seconds)

**Jacobo speaks. One person controls the app the entire time.**

**Scene 1: Login (Auth API)**
> "I built the authentication system. Here on the login page, you can see the Duke-branded interface. Let me sign in as a teacher using teacher@duke.edu."

- Type `teacher@duke.edu` into the email field
- Type `teacher123` into the password field
- Click **Sign In**
- Show the dashboard loads with the teacher's name in the navbar

> "The POST /api/auth/login endpoint validates credentials using bcrypt password hashing and creates a Flask-Login session. You can see the navbar shows my role as 'teacher'."

**Scene 2: Create a Course (Courses API)**
> "Now I'll demo the courses API. I'll create a new course."

- Click **+ New Course** button
- Type `CompSci 316: Database Systems` as the title
- Type `Learn relational databases, SQL, and query optimization` as the description
- Click **Create Course**
- Show the new course card appear in the catalog

> "The POST /api/courses endpoint creates the course record and associates it with me as the teacher. You can see it appears immediately in the catalog with the enrollment count at zero."

**Scene 3: Create an Assignment**
> "Let me click into the course and create an assignment."

- Click on the new course card
- Show the course detail page with the blue hero header
- Click **+ New Assignment**
- Fill in: Title = `Homework 1: ER Diagrams`, Max Points = `100`
- Click **Create Assignment**
- Show it appear in the assignments table

> "The POST /api/courses/:id/assignments endpoint creates the assignment linked to this course. The assignment table updates in real time."

---

### PART 2: SHEPARD'S APIs — Enrollment, Submissions & Grading (~60 seconds)

**Shepard speaks. Same person controls the app.**

**Scene 4: Student Enrollment (Enrollments API)**
> "I implemented the enrollment and submissions system. Let me log out and sign in as a student."

- Click **Log Out**
- Log in as `student@duke.edu` / `student123`
- Navigate to Course Catalog
- Click on `CompSci 316: Database Systems`
- Click **Enroll Now**
- Show the success message and enrollment count update to 1

> "The POST /api/courses/:id/enroll endpoint registers the student in the course. It checks for duplicates and verifies the user is actually a student. Now I can see the assignments and submit work."

**Scene 5: Submit Work (Submissions API)**
> "Now I'll submit an assignment."

- Click **Submit** next to `Homework 1: ER Diagrams`
- The submission modal opens — type: `Here is my ER diagram for the university database schema with 5 entities and their relationships.`
- Click **Submit Work**
- Show success message

> "The POST /api/assignments/:id/submit endpoint validates that I'm enrolled, prevents duplicate submissions, and stores my work. Let me check my grades page."

**Scene 6: View Grades (Grades API)**
> "On the Grades page, I can see all my submissions across courses."

- Click **Grades** in the navbar
- Show the grades page with stat cards and the grouped table
- Point out the "Pending" badge for ungraded items

> "The GET /api/students/me/grades endpoint joins submissions, assignments, and courses to give me a complete transcript view with grades, feedback, and submission dates."

---

### PART 3: GRADING FLOW (Shepard — 30 seconds)

> "Finally, let me show the grading flow from the teacher's side."

- Log out, log back in as `teacher@duke.edu` / `teacher123`
- Navigate to the course
- Click the **Submissions** link on an assignment row
- Show the submissions table with student names
- Click **Grade** on a submission
- Enter grade: `92`, feedback: `Excellent work on the ER diagram!`
- Click **Save Grade**
- Show the grade badge update from "Pending" to "92"
- Click **Statistics** tab — show completion rates and average grades

> "The PUT /api/submissions/:id/grade endpoint lets teachers assign grades and provide feedback. The statistics tab aggregates this data with average grades and completion percentages per assignment."

---

### OUTRO (Jacobo — 10 seconds)

> "That's DukeAcademy 2.0 — a complete course management system with authentication, course management, enrollment, submissions, and grading. Thanks for watching!"

---

## API Ownership Summary

| Team Member | APIs Implemented | Backend Files | Frontend Files |
|-------------|-----------------|---------------|----------------|
| **Jacobo Lopez Fernandez** | Auth (register, login, logout, me), Courses (CRUD), Assignments (CRUD) | `backend/app/routes/auth.py`, `backend/app/routes/courses.py`, `backend/app/routes/assignments.py` | `LoginPage.jsx`, `CoursesPage.jsx`, `Navbar.jsx` |
| **Shepard Seinfeld** | Enrollments (enroll, drop, roster, my-courses), Submissions (submit, list, grade, my-grades, stats) | `backend/app/routes/enrollments.py`, `backend/app/routes/submissions.py` | `CourseDetailPage.jsx` (enrollment + submission modals), `MyCoursesPage.jsx`, `GradesPage.jsx` |
