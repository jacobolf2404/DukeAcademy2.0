from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models.course import Course
from app.models.assignment import Assignment

assignments_bp = Blueprint("assignments", __name__, url_prefix="/api")


@assignments_bp.route("/courses/<int:course_id>/assignments", methods=["GET"])
def list_assignments(course_id):
    """List all assignments for a course."""
    Course.query.get_or_404(course_id)
    assignments = (
        Assignment.query.filter_by(course_id=course_id)
        .order_by(Assignment.due_date.asc())
        .all()
    )
    return jsonify([a.to_dict() for a in assignments]), 200


@assignments_bp.route("/courses/<int:course_id>/assignments", methods=["POST"])
@login_required
def create_assignment(course_id):
    """Create an assignment. Course teacher or admin only."""
    course = Course.query.get_or_404(course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    due_date = None
    if data.get("due_date"):
        try:
            due_date = datetime.fromisoformat(data["due_date"])
        except ValueError:
            return jsonify({"error": "Invalid due_date format. Use ISO 8601."}), 400

    assignment = Assignment(
        course_id=course_id,
        title=data["title"],
        description=data.get("description", ""),
        due_date=due_date,
        max_points=data.get("max_points", 100),
    )
    db.session.add(assignment)
    db.session.commit()
    return jsonify(assignment.to_dict()), 201


@assignments_bp.route("/assignments/<int:assignment_id>", methods=["PUT"])
@login_required
def update_assignment(assignment_id):
    """Update assignment. Course teacher or admin only."""
    assignment = Assignment.query.get_or_404(assignment_id)
    course = Course.query.get(assignment.course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if data.get("title"):
        assignment.title = data["title"]
    if "description" in data:
        assignment.description = data["description"]
    if data.get("due_date"):
        assignment.due_date = datetime.fromisoformat(data["due_date"])
    if data.get("max_points") is not None:
        assignment.max_points = data["max_points"]

    db.session.commit()
    return jsonify(assignment.to_dict()), 200


@assignments_bp.route("/assignments/<int:assignment_id>", methods=["DELETE"])
@login_required
def delete_assignment(assignment_id):
    """Delete assignment. Course teacher or admin only."""
    assignment = Assignment.query.get_or_404(assignment_id)
    course = Course.query.get(assignment.course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(assignment)
    db.session.commit()
    return jsonify({"message": "Assignment deleted"}), 200
