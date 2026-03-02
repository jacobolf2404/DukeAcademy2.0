from datetime import datetime
from app.extensions import db


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    student_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), primary_key=True
    )
    course_id = db.Column(
        db.Integer, db.ForeignKey("courses.id"), primary_key=True
    )
    enrolled_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "student_id": self.student_id,
            "course_id": self.course_id,
            "enrolled_at": self.enrolled_at.isoformat(),
        }
