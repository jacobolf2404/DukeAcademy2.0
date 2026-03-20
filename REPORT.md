# DukeAcademy 2.0 — Milestone 3 Report

## Project Overview

DukeAcademy 2.0 is a database-backed course management platform developed for CompSci 316 (Spring 2026). The application enables students, teachers, and administrators to manage courses, assignments, submissions, and grades through a modern web interface backed by a PostgreSQL relational database.

## Progress Since Milestone 2

Since our last milestone, we have moved from specification and schema design to a fully functional end-to-end application. Both team members have implemented at least one complete backend API endpoint with corresponding frontend elements, and the entire system is deployable via Docker Compose.

**Jacobo Lopez Fernandez** implemented the authentication system (register, login, logout, session management) and the course/assignment management APIs. The auth system uses bcrypt for password hashing and Flask-Login for session-based authentication. The courses API supports full CRUD operations with role-based access control — only teachers and admins can create or modify courses, and only admins can delete them. The assignments API allows teachers to create, update, and delete assignments with configurable due dates and point values. On the frontend, Jacobo built the Duke-branded login page, the course catalog with search and creation form, and the navigation bar.

**Shepard Seinfeld** implemented the enrollment system and the submissions/grading pipeline. The enrollment API allows students to enroll in and drop courses, with validation to prevent duplicate enrollments and ensure only students can enroll. Teachers can view class rosters with enrollment dates. The submissions API handles the complete workflow: students submit work (with validation that they are enrolled and haven't already submitted), teachers view all submissions for an assignment, and teachers grade submissions with numeric grades and written feedback. The statistics endpoint aggregates completion rates and average grades per assignment. On the frontend, Shepard built the course detail page (including enrollment buttons, submission modals, grading modals, roster and statistics tabs), the My Courses dashboard, and the Grades transcript page with overall statistics.

## Database Queries

Our application executes a variety of SQL queries through SQLAlchemy ORM, including: INSERT operations for user registration, course creation, enrollment, assignment posting, and submission; SELECT queries with JOINs across users, courses, enrollments, assignments, and submissions for roster views and grade transcripts; UPDATE operations for grading submissions and editing courses; DELETE operations with CASCADE for dropping courses and removing enrollments; and aggregate queries using AVG and COUNT for course statistics and completion rate calculations.

## Revised Feature Goals

Our original specification remains largely intact. We have successfully implemented all five core entities (users, courses, enrollments, assignments, submissions) and their associated CRUD operations. For future milestones, we propose adding:

- **Search and filtering** across the course catalog (partially implemented — client-side search is live)
- **Assignment editing and deletion** from the frontend (backend complete, frontend pending)
- **Admin dashboard** for user management (endpoint exists, page pending)
- **Notification system** for new grades and assignment postings

We do not anticipate major changes to our database schema, which has proven stable through development. The five-table normalized design with appropriate foreign keys, cascade deletes, and unique constraints has handled all current use cases without modification.

## Conclusion

DukeAcademy 2.0 is a functional course management system demonstrating relational database design, RESTful API development, session-based authentication, role-based access control, and a responsive React frontend. Both team members contributed distinct API endpoints that work together to deliver a cohesive user experience.
