"""Seed the database with sample data for development and demo."""

from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models import User, Course, Enrollment, Assignment, Submission


def seed():
    app = create_app()
    with app.app_context():
        print("Dropping existing data...")
        db.drop_all()
        db.create_all()

        # ── Users ──────────────────────────────────────────
        admin = User(name="Admin User", email="admin@duke.edu", role="admin")
        admin.set_password("admin123")

        teacher1 = User(name="Prof. Jun Yang", email="teacher@duke.edu", role="teacher")
        teacher1.set_password("teacher123")

        teacher2 = User(name="Prof. Bruce Maggs", email="maggs@duke.edu", role="teacher")
        teacher2.set_password("teacher123")

        students = []
        student_data = [
            ("Alice Chen", "alice@duke.edu"),
            ("Bob Martinez", "bob@duke.edu"),
            ("Carol Williams", "carol@duke.edu"),
            ("David Kim", "david@duke.edu"),
            ("Eva Johnson", "eva@duke.edu"),
        ]
        for name, email in student_data:
            s = User(name=name, email=email, role="student")
            s.set_password("student123")
            students.append(s)

        # Default demo student
        demo_student = User(name="Demo Student", email="student@duke.edu", role="student")
        demo_student.set_password("student123")
        students.append(demo_student)

        db.session.add_all([admin, teacher1, teacher2, demo_student] + students)
        db.session.flush()
        print(f"Created {2 + len(students) + 1} users")

        # ── Courses ────────────────────────────────────────
        cs316 = Course(
            title="CompSci 316: Introduction to Database Systems",
            description="Relational databases, SQL, query processing, transaction management, and data modeling.",
            teacher_id=teacher1.id,
        )
        cs310 = Course(
            title="CompSci 310: Introduction to Operating Systems",
            description="Processes, threads, synchronization, memory management, file systems.",
            teacher_id=teacher2.id,
        )
        cs201 = Course(
            title="CompSci 201: Data Structures and Algorithms",
            description="Fundamental data structures, algorithm analysis, sorting and searching.",
            teacher_id=teacher1.id,
        )

        db.session.add_all([cs316, cs310, cs201])
        db.session.flush()
        print(f"Created 3 courses")

        # ── Enrollments ───────────────────────────────────
        enrollments = []
        for s in students:
            enrollments.append(Enrollment(student_id=s.id, course_id=cs316.id))
        for s in students[:4]:
            enrollments.append(Enrollment(student_id=s.id, course_id=cs310.id))
        for s in students[:3]:
            enrollments.append(Enrollment(student_id=s.id, course_id=cs201.id))

        db.session.add_all(enrollments)
        db.session.flush()
        print(f"Created {len(enrollments)} enrollments")

        # ── Assignments ───────────────────────────────────
        now = datetime.utcnow()
        assignments_316 = [
            Assignment(
                course_id=cs316.id,
                title="Homework 1: ER Diagrams",
                description="Design an ER diagram for a university database.",
                due_date=now - timedelta(days=14),
                max_points=100,
            ),
            Assignment(
                course_id=cs316.id,
                title="Homework 2: Relational Algebra",
                description="Translate English queries to relational algebra expressions.",
                due_date=now - timedelta(days=7),
                max_points=100,
            ),
            Assignment(
                course_id=cs316.id,
                title="Homework 3: SQL Queries",
                description="Write SQL queries on the beer drinker's database.",
                due_date=now + timedelta(days=7),
                max_points=100,
            ),
            Assignment(
                course_id=cs316.id,
                title="Final Project: Milestone 2",
                description="Submit README.txt, REPORT.pdf, and demonstrate progress.",
                due_date=now + timedelta(days=21),
                max_points=200,
            ),
        ]
        assignments_310 = [
            Assignment(
                course_id=cs310.id,
                title="Lab 1: Process Scheduling",
                description="Implement FIFO and Round Robin schedulers.",
                due_date=now - timedelta(days=10),
                max_points=100,
            ),
        ]

        all_assignments = assignments_316 + assignments_310
        db.session.add_all(all_assignments)
        db.session.flush()
        print(f"Created {len(all_assignments)} assignments")

        # ── Submissions ───────────────────────────────────
        submissions = []
        for s in students:
            sub = Submission(
                assignment_id=assignments_316[0].id,
                student_id=s.id,
                content="ER diagram submission content here.",
                grade=round(75 + (hash(s.email) % 26), 2),
                feedback="Good work on the ER diagram.",
            )
            submissions.append(sub)

        for s in students[:4]:
            sub = Submission(
                assignment_id=assignments_316[1].id,
                student_id=s.id,
                content="Relational algebra answers.",
                grade=round(80 + (hash(s.email) % 21), 2),
            )
            submissions.append(sub)

        db.session.add_all(submissions)
        db.session.commit()
        print(f"Created {len(submissions)} submissions")
        print("\nSeeding complete!")
        print("Default logins:")
        print("  admin@duke.edu / admin123")
        print("  teacher@duke.edu / teacher123")
        print("  student@duke.edu / student123")


if __name__ == "__main__":
    seed()
