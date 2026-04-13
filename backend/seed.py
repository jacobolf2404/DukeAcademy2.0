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

        demo_student = User(name="Demo Student", email="student@duke.edu", role="student")
        demo_student.set_password("student123")
        students.append(demo_student)

        db.session.add_all([admin, teacher1, teacher2] + students)
        db.session.flush()
        print(f"Created {3 + len(students)} users")

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
        print("Created 3 courses")

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
            Assignment(course_id=cs316.id, title="Homework 1: ER Diagrams",
                       description="Design an ER diagram for a university database. Include all entities, relationships, and constraints.",
                       due_date=now - timedelta(days=14), max_points=100),
            Assignment(course_id=cs316.id, title="Homework 2: Relational Algebra",
                       description="Translate the following English queries to relational algebra expressions.",
                       due_date=now - timedelta(days=7), max_points=100),
            Assignment(course_id=cs316.id, title="Homework 3: SQL Queries",
                       description="Write SQL queries on the beer drinker's database. Test on both db0 and db1.",
                       due_date=now + timedelta(days=7), max_points=100),
            Assignment(course_id=cs316.id, title="Final Project: Milestone 4",
                       description="Submit README.txt, REPORT.pdf, CODE.zip, and a demo video link.",
                       due_date=now + timedelta(days=21), max_points=200),
        ]
        assignments_310 = [
            Assignment(course_id=cs310.id, title="Lab 1: Process Scheduling",
                       description="Implement FIFO and Round Robin schedulers in C.",
                       due_date=now - timedelta(days=10), max_points=100),
        ]

        all_assignments = assignments_316 + assignments_310
        db.session.add_all(all_assignments)
        db.session.flush()
        print(f"Created {len(all_assignments)} assignments")

        # ── Submissions (some graded, some pending) ───────
        submissions = []

        # HW1: all students submitted, only 2 graded by teacher
        for s in students:
            sub = Submission(
                assignment_id=assignments_316[0].id,
                student_id=s.id,
                content='{"text":"Here is my ER diagram for the university database. I identified the following entities: Student, Course, Instructor, Department, and Enrollment. Key relationships include students enrolling in courses (M:N) and instructors teaching courses (1:N).","attachments":[]}',
            )
            submissions.append(sub)

        # Grade only first 2 submissions for HW1
        db.session.add_all(submissions)
        db.session.flush()

        submissions[0].grade = 92
        submissions[0].feedback = "Excellent work! Clear diagram with proper cardinalities."
        submissions[1].grade = 85
        submissions[1].feedback = "Good effort. Missing some constraints on the Department entity."

        # HW2: only 3 students submitted, 1 graded
        for s in students[:3]:
            sub = Submission(
                assignment_id=assignments_316[1].id,
                student_id=s.id,
                content='{"text":"Relational algebra solutions:\\n\\n(a) π_name(σ_bar=\\"James Joyce Pub\\"(frequents))\\n(b) π_name(σ_times_a_week=2(frequents ⋈_{drinker=name} drinkers))\\n(c) π_name(serves ⋈ σ_beer=\\"Amstel\\"(serves)) - π_name(serves ⋈ σ_beer=\\"Corona\\"(serves))","attachments":[]}',
            )
            submissions.append(sub)

        db.session.add_all(submissions[-3:])
        db.session.flush()

        submissions[-3].grade = 95
        submissions[-3].feedback = "Perfect solutions. Well-formatted expressions."

        db.session.commit()
        print(f"Created {len(submissions)} submissions (3 graded, rest awaiting teacher review)")
        print("\nSeeding complete!")
        print("Default logins:")
        print("  admin@duke.edu / admin123")
        print("  teacher@duke.edu / teacher123")
        print("  student@duke.edu / student123")
        print("  alice@duke.edu / student123")
        print("  bob@duke.edu / student123")


if __name__ == "__main__":
    seed()
