from app.routes.auth import auth_bp
from app.routes.courses import courses_bp
from app.routes.enrollments import enrollments_bp
from app.routes.assignments import assignments_bp
from app.routes.submissions import submissions_bp
from app.routes.admin import admin_bp
from app.routes.announcements import announcements_bp
from app.routes.dashboard import dashboard_bp

__all__ = [
    "auth_bp", "courses_bp", "enrollments_bp", "assignments_bp",
    "submissions_bp", "admin_bp", "announcements_bp", "dashboard_bp",
]
