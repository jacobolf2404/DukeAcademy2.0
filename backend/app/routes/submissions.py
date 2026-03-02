from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func
from app.extensions import db
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.submission import Submission

submissions_bp = Blueprint("submissions", __name__, url_prefix="/api")


@submissions_bp.route("/assignments/<int:assignment_id>/submit", methods=["POST"])
@login_required
def submit(assignment_id):
    """Submit work for an assignment. Students only."""
    if current_user.role != "student":
        return jsonify({"error": "Only students can submit"}), 403

    assignment = Assignment.query.get_or_404(assignment_id)

    # Check student is enrolled in the course
    enrolled = Enrollment.query.filter_by(
        student_id=current_user.id, course_id=assignment.course_id
    ).first()
    if not enrolled:
        return jsonify({"error": "Not enrolled in this course"}), 403

    # Check for duplicate submission
    existing = Submission.query.filter_by(
        assignment_id=assignment_id, student_id=current_user.id
    ).first()
    if existing:
        return jsonify({"error": "Already submitted. Use PUT to update."}), 409

    data = request.get_json() or {}
    submission = Submission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        content=data.get("content", ""),
    )
    db.session.add(submission)
    db.session.commit()
    return jsonify(submission.to_dict()), 201


@submissions_bp.route("/assignments/<int:assignment_id>/submissions", methods=["GET"])
@login_required
def list_submissions(assignment_id):
    """List submissions for an assignment. Teacher of the course or admin."""
    assignment = Assignment.query.get_or_404(assignment_id)
    course = Course.query.get(assignment.course_id)

    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    submissions = Submission.query.filter_by(assignment_id=assignment_id).all()
    return jsonify([s.to_dict(include_student=True) for s in submissions]), 200


@submissions_bp.route("/submissions/<int:submission_id>/grade", methods=["PUT"])
@login_required
def grade_submission(submission_id):
    """Grade a submission. Teacher of the course or admin."""
    submission = Submission.query.get_or_404(submission_id)
    assignment = Assignment.query.get(submission.assignment_id)
    course = Course.query.get(assignment.course_id)

    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if data.get("grade") is not None:
        submission.grade = data["grade"]
    if data.get("feedback") is not None:
        submission.feedback = data["feedback"]

    db.session.commit()
    return jsonify(submission.to_dict()), 200


@submissions_bp.route("/students/me/grades", methods=["GET"])
@login_required
def my_grades():
    """Get current student's grades across all courses."""
    if current_user.role != "student":
        return jsonify({"error": "Only students can view their own grades"}), 403

    submissions = (
        Submission.query.filter_by(student_id=current_user.id)
        .join(Assignment)
        .join(Course)
        .all()
    )

    grades = []
    for s in submissions:
        grades.append({
            "course_title": s.assignment.course.title,
            "assignment_title": s.assignment.title,
            "max_points": float(s.assignment.max_points),
            "grade": float(s.grade) if s.grade is not None else None,
            "feedback": s.feedback,
            "submitted_at": s.submitted_at.isoformat(),
        })

    return jsonify(grades), 200


@submissions_bp.route("/courses/<int:course_id>/stats", methods=["GET"])
@login_required
def course_stats(course_id):
    """Get aggregate stats for a course. Teacher or admin."""
    course = Course.query.get_or_404(course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    enrollment_count = Enrollment.query.filter_by(course_id=course_id).count()
    assignment_count = Assignment.query.filter_by(course_id=course_id).count()

    # Average grade per assignment
    assignments = Assignment.query.filter_by(course_id=course_id).all()
    assignment_stats = []
    for a in assignments:
        avg = db.session.query(func.avg(Submission.grade)).filter(
            Submission.assignment_id == a.id,
            Submission.grade.isnot(None),
        ).scalar()
        sub_count = Submission.query.filter_by(assignment_id=a.id).count()
        assignment_stats.append({
            "assignment_id": a.id,
            "title": a.title,
            "submission_count": sub_count,
            "completion_rate": round(sub_count / enrollment_count * 100, 1) if enrollment_count > 0 else 0,
            "average_grade": round(float(avg), 2) if avg else None,
        })

    return jsonify({
        "course_id": course_id,
        "enrollment_count": enrollment_count,
        "assignment_count": assignment_count,
        "assignments": assignment_stats,
    }), 200
