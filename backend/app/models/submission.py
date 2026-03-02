from datetime import datetime
from app.extensions import db


class Submission(db.Model):
    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(
        db.Integer, db.ForeignKey("assignments.id"), nullable=False
    )
    student_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    grade = db.Column(db.Numeric(5, 2))
    feedback = db.Column(db.Text)

    __table_args__ = (
        db.UniqueConstraint("assignment_id", "student_id", name="uq_submission"),
    )

    def to_dict(self, include_student=False):
        data = {
            "id": self.id,
            "assignment_id": self.assignment_id,
            "student_id": self.student_id,
            "content": self.content,
            "submitted_at": self.submitted_at.isoformat(),
            "grade": float(self.grade) if self.grade is not None else None,
            "feedback": self.feedback,
        }
        if include_student:
            data["student"] = self.student.to_dict()
        return data
