import csv
import io
from flask import Blueprint, jsonify, Response
from flask_login import login_required, current_user
from sqlalchemy import and_
from app.extensions import db
from app.models import User, Course, Enrollment, Assignment, Submission

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api")


@dashboard_bp.route("/dashboard", methods=["GET"])
@login_required
def student_dashboard():
    if current_user.role != "student":
        return jsonify({"error": "Students only"}), 403

    enrollments = Enrollment.query.filter_by(student_id=current_user.id).all()
    course_ids = [e.course_id for e in enrollments]

    # Upcoming assignments
    upcoming = (Assignment.query.filter(Assignment.course_id.in_(course_ids))
                .order_by(Assignment.due_date.asc()).limit(10).all())
    upcoming_data = []
    for a in upcoming:
        sub = Submission.query.filter_by(assignment_id=a.id, student_id=current_user.id).first()
        upcoming_data.append({
            **a.to_dict(),
            "course_title": a.course.title,
            "submitted": sub is not None,
            "grade": float(sub.grade) if sub and sub.grade is not None else None,
        })

    # Recent grades
    recent_grades = (Submission.query.filter(
        Submission.student_id == current_user.id,
        Submission.grade.isnot(None))
        .order_by(Submission.submitted_at.desc()).limit(5).all())
    grades_data = [{
        "assignment_title": s.assignment.title,
        "course_title": s.assignment.course.title,
        "grade": float(s.grade),
        "max_points": float(s.assignment.max_points),
        "feedback": s.feedback,
    } for s in recent_grades]

    return jsonify({
        "enrolled_count": len(course_ids),
        "upcoming_assignments": upcoming_data,
        "recent_grades": grades_data,
    }), 200


@dashboard_bp.route("/courses/<int:course_id>/export-grades", methods=["GET"])
@login_required
def export_grades(course_id):
    course = Course.query.get_or_404(course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    assignments = Assignment.query.filter_by(course_id=course_id).order_by(Assignment.created_at).all()
    enrollments = Enrollment.query.filter_by(course_id=course_id).all()

    output = io.StringIO()
    writer = csv.writer(output)

    header = ["Student Name", "Email"] + [a.title for a in assignments] + ["Total", "Percentage"]
    writer.writerow(header)

    for e in enrollments:
        student = User.query.get(e.student_id)
        row = [student.name, student.email]
        total = 0
        max_total = 0
        for a in assignments:
            sub = Submission.query.filter_by(assignment_id=a.id, student_id=student.id).first()
            if sub and sub.grade is not None:
                row.append(float(sub.grade))
                total += float(sub.grade)
            else:
                row.append("")
            max_total += float(a.max_points)
        row.append(total)
        row.append(f"{(total / max_total * 100):.1f}%" if max_total > 0 else "N/A")
        writer.writerow(row)

    output.seek(0)
    return Response(output.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": f"attachment; filename={course.title}_grades.csv"})
