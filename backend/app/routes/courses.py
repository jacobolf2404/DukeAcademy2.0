from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models.course import Course

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")


@courses_bp.route("", methods=["GET"])
def list_courses():
    """List all courses. Public endpoint."""
    courses = Course.query.order_by(Course.created_at.desc()).all()
    return jsonify([c.to_dict(include_teacher=True) for c in courses]), 200


@courses_bp.route("", methods=["POST"])
@login_required
def create_course():
    """Create a course. Teacher or admin only."""
    if current_user.role not in ("teacher", "admin"):
        return jsonify({"error": "Only teachers and admins can create courses"}), 403

    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    course = Course(
        title=data["title"],
        description=data.get("description", ""),
        teacher_id=current_user.id,
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201


@courses_bp.route("/<int:course_id>", methods=["GET"])
def get_course(course_id):
    """Get a single course with details."""
    course = Course.query.get_or_404(course_id)
    return jsonify(course.to_dict(include_teacher=True)), 200


@courses_bp.route("/<int:course_id>", methods=["PUT"])
@login_required
def update_course(course_id):
    """Update course. Owner teacher or admin only."""
    course = Course.query.get_or_404(course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if data.get("title"):
        course.title = data["title"]
    if "description" in data:
        course.description = data["description"]

    db.session.commit()
    return jsonify(course.to_dict()), 200


@courses_bp.route("/<int:course_id>", methods=["DELETE"])
@login_required
def delete_course(course_id):
    """Delete course. Admin only."""
    if current_user.role != "admin":
        return jsonify({"error": "Only admins can delete courses"}), 403

    course = Course.query.get_or_404(course_id)
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted"}), 200
