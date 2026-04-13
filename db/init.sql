-- DukeAcademy 2.0 Database Schema
-- CompSci 316, Spring 2026

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student', 'teacher', 'admin')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    teacher_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
    student_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS assignments (
    id          SERIAL PRIMARY KEY,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    due_date    TIMESTAMP,
    max_points  NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
    id              SERIAL PRIMARY KEY,
    assignment_id   INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT,
    submitted_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    grade           NUMERIC(5,2),
    feedback        TEXT,
    UNIQUE (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS announcements (
    id          SERIAL PRIMARY KEY,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    pinned      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_teacher       ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student    ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course     ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course     ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due        ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student    ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_announcements_course   ON announcements(course_id);
