from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models.course import Course
from app.models.announcement import Announcement

announcements_bp = Blueprint("announcements", __name__, url_prefix="/api")


@announcements_bp.route("/courses/<int:course_id>/announcements", methods=["GET"])
def list_announcements(course_id):
    Course.query.get_or_404(course_id)
    anns = (Announcement.query.filter_by(course_id=course_id)
            .order_by(Announcement.pinned.desc(), Announcement.created_at.desc()).all())
    return jsonify([a.to_dict() for a in anns]), 200


@announcements_bp.route("/courses/<int:course_id>/announcements", methods=["POST"])
@login_required
def create_announcement(course_id):
    course = Course.query.get_or_404(course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    if not data or not data.get("title") or not data.get("body"):
        return jsonify({"error": "Title and body required"}), 400
    ann = Announcement(
        course_id=course_id, author_id=current_user.id,
        title=data["title"], body=data["body"], pinned=data.get("pinned", False))
    db.session.add(ann)
    db.session.commit()
    return jsonify(ann.to_dict()), 201


@announcements_bp.route("/announcements/<int:ann_id>", methods=["DELETE"])
@login_required
def delete_announcement(ann_id):
    ann = Announcement.query.get_or_404(ann_id)
    course = Course.query.get(ann.course_id)
    if current_user.role != "admin" and course.teacher_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(ann)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200
