from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models.course import Course
from app.models.enrollment import Enrollment

enrollments_bp = Blueprint("enrollments", __name__, url_prefix="/api/courses")


@enrollments_bp.route("/<int:course_id>/enroll", methods=["POST"])
@login_required
def enroll(course_id):
    """Enroll current student in a course."""
    if current_user.role != "student":
        return jsonify({"error": "Only students can enroll"}), 403

    Course.query.get_or_404(course_id)

    existing = Enrollment.query.filter_by(
        student_id=current_user.id, course_id=course_id
    ).first()
    if existing:
        return jsonify({"error": "Already enrolled"}), 409

    enrollment = Enrollment(student_id=current_user.id, course_id=course_id)
    db.session.add(enrollment)
    db.session.commit()
    return jsonify(enrollment.to_dict()), 201


@enrollments_bp.route("/<int:course_id>/enroll", methods=["DELETE"])
@login_required
def drop(course_id):
    """Drop current student from a course."""
    enrollment = Enrollment.query.filter_by(
        student_id=current_user.id, course_id=course_id
    ).first()
    if not enrollment:
        return jsonify({"error": "Not enrolled in this course"}), 404

    db.session.delete(enrollment)
    db.session.commit()
    return jsonify({"message": "Dropped from course"}), 200


@enrollments_bp.route("/<int:course_id>/roster", methods=["GET"])
@login_required
def roster(course_id):
    """View class roster. Teacher of this course or admin only."""
    course = Course.query.get_or_404(course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    students = []
    for e in enrollments:
        student_data = e.student.to_dict()
        student_data["enrolled_at"] = e.enrolled_at.isoformat()
        students.append(student_data)

    return jsonify(students), 200


@enrollments_bp.route("/my-courses", methods=["GET"])
@login_required
def my_courses():
    """Get courses the current student is enrolled in."""
    if current_user.role == "student":
        enrollments = Enrollment.query.filter_by(student_id=current_user.id).all()
        courses = [Course.query.get(e.course_id).to_dict(include_teacher=True) for e in enrollments]
    elif current_user.role == "teacher":
        courses = [c.to_dict() for c in current_user.taught_courses.all()]
    else:
        courses = [c.to_dict(include_teacher=True) for c in Course.query.all()]
    return jsonify(courses), 200
