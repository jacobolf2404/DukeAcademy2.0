"""Seed the database with sample data for development and demo."""
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models import User, Course, Enrollment, Assignment, Submission, Announcement


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
        for name, email in [("Alice Chen","alice@duke.edu"),("Bob Martinez","bob@duke.edu"),
                            ("Carol Williams","carol@duke.edu"),("David Kim","david@duke.edu"),
                            ("Eva Johnson","eva@duke.edu"),("Demo Student","student@duke.edu")]:
            s = User(name=name, email=email, role="student")
            s.set_password("student123")
            students.append(s)

        db.session.add_all([admin, teacher1, teacher2] + students)
        db.session.flush()
        print(f"Created {3 + len(students)} users")

        # ── Courses ────────────────────────────────────────
        cs316 = Course(title="CompSci 316: Introduction to Database Systems",
                       description="Relational databases, SQL, query processing, transaction management, and data modeling. This course covers the design, implementation, and use of database management systems.",
                       teacher_id=teacher1.id)
        cs310 = Course(title="CompSci 310: Introduction to Operating Systems",
                       description="Processes, threads, synchronization, memory management, file systems, and distributed systems fundamentals.",
                       teacher_id=teacher2.id)
        cs201 = Course(title="CompSci 201: Data Structures and Algorithms",
                       description="Fundamental data structures including trees, graphs, hash tables. Algorithm analysis, sorting, and searching techniques.",
                       teacher_id=teacher1.id)
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
        a316 = [
            Assignment(course_id=cs316.id, title="Homework 1: ER Diagrams",
                       description="Design an ER diagram for a university database. Include all entities, relationships, cardinalities, and constraints. Submit as a PDF or image.",
                       due_date=now - timedelta(days=14), max_points=100),
            Assignment(course_id=cs316.id, title="Homework 2: Relational Algebra",
                       description="Translate the following English queries to relational algebra. Show your work for each step.",
                       due_date=now - timedelta(days=7), max_points=100),
            Assignment(course_id=cs316.id, title="Homework 3: SQL Queries",
                       description="Write SQL queries on the beer drinker's database. Test on both db0 and db1 test databases. Submit .sql files.",
                       due_date=now + timedelta(days=7), max_points=100),
            Assignment(course_id=cs316.id, title="Final Project",
                       description="Submit README.txt, REPORT.pdf, CODE.zip, and a demo video link demonstrating all features.",
                       due_date=now + timedelta(days=21), max_points=200),
        ]
        a310 = [
            Assignment(course_id=cs310.id, title="Lab 1: Process Scheduling",
                       description="Implement FIFO and Round Robin schedulers in C. Include test cases.",
                       due_date=now - timedelta(days=10), max_points=100),
            Assignment(course_id=cs310.id, title="Lab 2: Virtual Memory",
                       description="Implement page replacement algorithms: FIFO, LRU, and Clock.",
                       due_date=now + timedelta(days=5), max_points=100),
        ]
        db.session.add_all(a316 + a310)
        db.session.flush()
        print(f"Created {len(a316) + len(a310)} assignments")

        # ── Submissions (mix of graded and ungraded) ──────
        subs = []
        for s in students:
            subs.append(Submission(assignment_id=a316[0].id, student_id=s.id,
                content='{"text":"ER diagram with entities: Student, Course, Instructor, Department, Enrollment. Relationships: enrolls (M:N), teaches (1:N), belongs_to (N:1).","attachments":[]}'))
        for s in students[:4]:
            subs.append(Submission(assignment_id=a316[1].id, student_id=s.id,
                content='{"text":"(a) π_name(σ_bar=\\"James Joyce Pub\\"(frequents))\\n(b) π_name(σ_times=2(frequents ⋈ drinkers))\\n(c) π_name(σ_beer=\\"Amstel\\"(serves)) − π_name(σ_beer=\\"Corona\\"(serves))","attachments":[]}'))
        for s in students[:2]:
            subs.append(Submission(assignment_id=a310[0].id, student_id=s.id,
                content='{"text":"FIFO scheduler implementation with ready queue and context switching. Round Robin with quantum=4ms.","attachments":[]}'))

        db.session.add_all(subs)
        db.session.flush()

        # Grade only a few
        subs[0].grade = 92; subs[0].feedback = "Excellent ER diagram. Clear cardinalities and constraints."
        subs[1].grade = 85; subs[1].feedback = "Good work. Missing ISA relationship for Department."
        subs[2].grade = 78; subs[2].feedback = "Decent effort. Weak relationship between Course and Department."
        subs[6].grade = 95; subs[6].feedback = "Perfect relational algebra. Well-formatted."
        subs[7].grade = 88; subs[7].feedback = "Good solutions. Minor error in part (c)."

        # ── Announcements ─────────────────────────────────
        anns = [
            Announcement(course_id=cs316.id, author_id=teacher1.id, title="Welcome to CompSci 316!",
                         body="Welcome to Introduction to Database Systems. Please review the syllabus and set up your Docker environment before the first lab.", pinned=True),
            Announcement(course_id=cs316.id, author_id=teacher1.id, title="Homework 3 Released",
                         body="Homework 3 on SQL queries is now available. Remember to test on both db0 and db1. Office hours are extended this week."),
            Announcement(course_id=cs316.id, author_id=teacher1.id, title="Midterm Grades Posted",
                         body="Midterm grades have been posted. The average was 82/100. Please come to office hours if you have questions about your grade."),
            Announcement(course_id=cs310.id, author_id=teacher2.id, title="Lab 2 Due Date Extended",
                         body="Lab 2 deadline has been extended by 3 days due to the container issues some students experienced. New deadline is posted.", pinned=True),
        ]
        db.session.add_all(anns)
        db.session.commit()

        print(f"Created {len(subs)} submissions ({5} graded, rest awaiting review)")
        print(f"Created {len(anns)} announcements")
        print("\nSeeding complete!")
        print("Logins:  admin@duke.edu/admin123  teacher@duke.edu/teacher123  student@duke.edu/student123")


if __name__ == "__main__":
    seed()
