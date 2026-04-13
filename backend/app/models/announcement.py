from datetime import datetime
from app.extensions import db


class Announcement(db.Model):
    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    pinned = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    author = db.relationship("User", backref="announcements")
    course = db.relationship("Course", backref="announcements")

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "author_id": self.author_id,
            "author_name": self.author.name if self.author else None,
            "title": self.title,
            "body": self.body,
            "pinned": self.pinned,
            "created_at": self.created_at.isoformat(),
        }
