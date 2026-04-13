from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.assignment import Assignment
from app.models.submission import Submission

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def require_admin():
    if not current_user.is_authenticated or current_user.role != "admin":
        return jsonify({"error": "Admin access required"}), 403
    return None


@admin_bp.route("/users", methods=["GET"])
@login_required
def list_users():
    """List all users. Admin only."""
    err = require_admin()
    if err:
        return err
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@login_required
def update_user(user_id):
    """Update a user's role or info. Admin only."""
    err = require_admin()
    if err:
        return err
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if data.get("role") and data["role"] in ("student", "teacher", "admin"):
        user.role = data["role"]
    if data.get("name"):
        user.name = data["name"]
    if data.get("email"):
        user.email = data["email"]
    db.session.commit()
    return jsonify(user.to_dict()), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@login_required
def delete_user(user_id):
    """Delete a user. Admin only. Cannot delete self."""
    err = require_admin()
    if err:
        return err
    if user_id == current_user.id:
        return jsonify({"error": "Cannot delete yourself"}), 400
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


@admin_bp.route("/stats", methods=["GET"])
@login_required
def platform_stats():
    """Get platform-wide statistics. Admin only."""
    err = require_admin()
    if err:
        return err
    return jsonify({
        "total_users": User.query.count(),
        "total_students": User.query.filter_by(role="student").count(),
        "total_teachers": User.query.filter_by(role="teacher").count(),
        "total_admins": User.query.filter_by(role="admin").count(),
        "total_courses": Course.query.count(),
        "total_enrollments": Enrollment.query.count(),
        "total_assignments": Assignment.query.count(),
        "total_submissions": Submission.query.count(),
    }), 200
