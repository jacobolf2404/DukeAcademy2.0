from datetime import datetime
from app.extensions import db


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    teacher_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    enrollments = db.relationship("Enrollment", backref="course", lazy="dynamic")
    assignments = db.relationship(
        "Assignment", backref="course", lazy="dynamic", cascade="all, delete-orphan"
    )

    def to_dict(self, include_teacher=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "teacher_id": self.teacher_id,
            "created_at": self.created_at.isoformat(),
            "enrollment_count": self.enrollments.count(),
        }
        if include_teacher:
            data["teacher"] = self.teacher.to_dict()
        return data
