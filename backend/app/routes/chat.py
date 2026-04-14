import os
import requests
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

chat_bp = Blueprint("chat", __name__, url_prefix="/api")

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """You are the DukeAcademy 2.0 assistant, a helpful chatbot embedded in a course management platform built for Duke University's CompSci 316 class. 

The platform has these features:
- Students can browse a course catalog, enroll/drop courses, submit assignments (with file attachments), and view their grades
- Teachers can create courses and assignments, view rosters, grade submissions with feedback, view analytics, post announcements, and export grades to CSV
- Admins can manage all users (change roles, delete), manage courses, and view platform-wide statistics

Keep responses concise (2-4 sentences) and helpful. If asked about something outside the platform, you can still help but gently note you're primarily a DukeAcademy assistant."""


@chat_bp.route("/chat", methods=["POST"])
@login_required
def chat():
    data = request.get_json()
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message required"}), 400

    if not ANTHROPIC_API_KEY:
        # Fallback to simple responses if no API key
        return jsonify({"reply": get_fallback_reply(message)}), 200

    try:
        # Build messages for Claude
        messages = []
        for h in history[-10:]:  # Last 10 messages for context
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 300,
                "system": SYSTEM_PROMPT,
                "messages": messages,
            },
            timeout=15,
        )

        if response.status_code == 200:
            result = response.json()
            reply = result["content"][0]["text"]
            return jsonify({"reply": reply}), 200
        else:
            return jsonify({"reply": get_fallback_reply(message)}), 200

    except Exception:
        return jsonify({"reply": get_fallback_reply(message)}), 200


def get_fallback_reply(msg):
    """Keyword-based fallback when API key is not configured."""
    lower = msg.lower()
    if any(w in lower for w in ["hello", "hi", "hey"]):
        return "Hey there! I'm the DukeAcademy assistant. Ask me about courses, assignments, grades, or how to use the platform!"
    if any(w in lower for w in ["help", "how do i", "how to"]):
        return "I can help with enrolling in courses, submitting assignments, viewing grades, and navigating the platform. What would you like to know?"
    if any(w in lower for w in ["grade", "score", "points"]):
        return "To view your grades, click Grades in the top navigation. You'll see all submissions organized by course with scores and teacher feedback."
    if any(w in lower for w in ["enroll", "join", "sign up for"]):
        return "To enroll: go to the Course Catalog, click a course, then click the green Enroll button. You can drop anytime from the course page."
    if any(w in lower for w in ["submit", "upload", "turn in"]):
        return "To submit: go to your course, find the assignment, click Submit. You can write your answer and attach files like PDFs or code."
    if any(w in lower for w in ["assignment", "homework", "due"]):
        return "Assignments are in each course's Assignments tab. You can see titles, due dates, point values, and submission counts."
    if any(w in lower for w in ["thank"]):
        return "You're welcome! Let me know if you need anything else."
    return "I can help with courses, assignments, grades, enrollment, and navigation. Try asking about one of those!"
