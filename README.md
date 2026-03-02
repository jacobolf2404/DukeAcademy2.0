# DukeAcademy 2.0

A database-backed course management platform built for CompSci 316 (Spring 2026) at Duke University.

## Overview

DukeAcademy 2.0 is a lightweight, database-driven course management web application inspired by Duke Academy, an AI-powered learning platform developed at Duke University. Rather than replicating the full platform, DukeAcademy 2.0 targets the relational data management core: user authentication, course administration, student enrollment, assignment delivery, and progress tracking.

Administrators can create courses, teachers can post assignments and view class rosters, and students can enroll in courses, submit work, and track their progress — all backed by a fully normalized PostgreSQL schema.

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Database       | PostgreSQL 16                     |
| Backend        | Python 3.11 / Flask / SQLAlchemy  |
| Frontend       | React 18 / Vite                   |
| Auth           | Flask-Login + bcrypt              |
| Containerization | Docker & Docker Compose         |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js 18+](https://nodejs.org/) (for local frontend dev)
- [Python 3.11+](https://www.python.org/) (for local backend dev)
- Git

## Quick Start (Docker — Recommended)

```bash
# 1. Clone the repository
git clone <YOUR_REPO_URL>
cd dukeacademy2

# 2. Copy environment file
cp .env.example .env

# 3. Build and start all services
docker compose up --build

# 4. (First time) Seed the database with sample data
docker compose exec backend python seed.py
```

Services will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **PostgreSQL:** localhost:5432

## Local Development (Without Docker)

### Database
```bash
# Option A: Use Docker just for the database
docker compose up db -d

# Option B: Use a local PostgreSQL instance
createdb dukeacademy2
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade                  # Run migrations
python seed.py                    # Seed sample data
flask run                         # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

## Default Accounts (after seeding)

| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Admin   | admin@duke.edu      | admin123  |
| Teacher | teacher@duke.edu    | teacher123|
| Student | student@duke.edu    | student123|

## Project Structure

```
dukeacademy2/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration
│   │   ├── extensions.py        # SQLAlchemy, Login, Bcrypt
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── course.py
│   │   │   ├── enrollment.py
│   │   │   ├── assignment.py
│   │   │   └── submission.py
│   │   └── routes/              # API route blueprints
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── courses.py
│   │       ├── enrollments.py
│   │       ├── assignments.py
│   │       └── submissions.py
│   ├── migrations/              # Flask-Migrate (Alembic)
│   ├── seed.py                  # Database seeder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page-level views
│   │   ├── styles/              # CSS
│   │   ├── api.js               # Axios API client
│   │   ├── App.jsx              # Router + layout
│   │   └── main.jsx             # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── db/
│   └── init.sql                 # Schema DDL (reference)
├── docs/
│   └── er-diagram.md            # ER diagram (Mermaid)
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── README.txt                   # Milestone submission
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Log in
- `POST /api/auth/logout` — Log out
- `GET  /api/auth/me` — Get current user

### Courses
- `GET    /api/courses` — List all courses
- `POST   /api/courses` — Create course (teacher/admin)
- `GET    /api/courses/:id` — Get course details
- `PUT    /api/courses/:id` — Update course
- `DELETE /api/courses/:id` — Delete course (admin)

### Enrollments
- `POST   /api/courses/:id/enroll` — Enroll in course (student)
- `DELETE /api/courses/:id/enroll` — Drop course
- `GET    /api/courses/:id/roster` — View roster (teacher)

### Assignments
- `GET    /api/courses/:id/assignments` — List assignments
- `POST   /api/courses/:id/assignments` — Create assignment (teacher)
- `PUT    /api/assignments/:id` — Update assignment
- `DELETE /api/assignments/:id` — Delete assignment

### Submissions
- `POST   /api/assignments/:id/submit` — Submit work (student)
- `GET    /api/assignments/:id/submissions` — View submissions (teacher)
- `PUT    /api/submissions/:id/grade` — Grade submission (teacher)
- `GET    /api/students/me/grades` — View own grades (student)

## Database Schema

See `db/init.sql` for the full DDL and `docs/er-diagram.md` for the ER diagram.

Core tables: `users`, `courses`, `enrollments`, `assignments`, `submissions`

## Team

- **Jacobo Lopez Fernandez** — jl1331@duke.edu
- **Shepard Seinfeld** — ss1556@duke.edu

## License

This project was built for educational purposes as part of Duke University's CompSci 316 course.
