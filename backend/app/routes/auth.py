import os
import re
import random
import requests as http_requests
from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from app.extensions import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

MAILERSEND_API_KEY = os.environ.get("MAILERSEND_API_KEY", "")
MAILERSEND_FROM_EMAIL = os.environ.get("MAILERSEND_FROM_EMAIL", "noreply@trial-0p7kx4xjz7og9yjr.mlsender.net")

# In-memory store for verification codes
pending_verifications = {}


def send_verification_email(to_email, code):
    """Send a 6-digit verification code via MailerSend."""
    if not MAILERSEND_API_KEY:
        print(f"\n{'='*50}")
        print(f"  VERIFICATION CODE for {to_email}: {code}")
        print(f"  (No MailerSend key configured — code printed here)")
        print(f"{'='*50}\n")
        return True

    try:
        response = http_requests.post(
            "https://api.mailersend.com/v1/email",
            headers={
                "Authorization": f"Bearer {MAILERSEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": {
                    "email": MAILERSEND_FROM_EMAIL,
                    "name": "DukeAcademy 2.0",
                },
                "to": [{"email": to_email}],
                "subject": f"Your DukeAcademy Verification Code: {code}",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
                    <div style="background: #001A57; color: white; padding: 1.5rem; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 1.5rem;">DukeAcademy 2.0</h1>
                    </div>
                    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 2rem; border-radius: 0 0 10px 10px;">
                        <p style="color: #374151; font-size: 1rem;">Your verification code is:</p>
                        <div style="background: #f3f4f6; border-radius: 8px; padding: 1.25rem; text-align: center; margin: 1.5rem 0;">
                            <span style="font-size: 2.5rem; font-weight: 800; letter-spacing: 0.5rem; color: #001A57;">{code}</span>
                        </div>
                        <p style="color: #6b7280; font-size: 0.875rem;">Enter this code to complete your registration. This code expires in 10 minutes.</p>
                        <p style="color: #9ca3af; font-size: 0.75rem; margin-top: 1.5rem;">If you didn't request this code, you can safely ignore this email.</p>
                    </div>
                </div>
                """,
            },
            timeout=10,
        )
        if response.status_code in (200, 201, 202):
            print(f"Verification email sent to {to_email}")
            return True
        else:
            print(f"MailerSend error {response.status_code}: {response.text}")
            print(f"FALLBACK — VERIFICATION CODE for {to_email}: {code}")
            return True
    except Exception as e:
        print(f"Email send failed: {e}")
        print(f"FALLBACK — VERIFICATION CODE for {to_email}: {code}")
        return True


@auth_bp.route("/register/request-code", methods=["POST"])
def request_code():
    """Step 1: Validate info and send a 6-digit verification code."""
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password") or not data.get("name"):
        return jsonify({"error": "Name, email, and password are required"}), 400
    if not EMAIL_RE.match(data["email"]):
        return jsonify({"error": "Please enter a valid email address"}), 400
    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    code = str(random.randint(100000, 999999))
    pending_verifications[data["email"]] = {
        "code": code,
        "name": data["name"],
        "password": data["password"],
        "role": data.get("role", "student"),
    }

    send_verification_email(data["email"], code)

    return jsonify({"message": "Verification code sent", "email": data["email"]}), 200


@auth_bp.route("/register/verify", methods=["POST"])
def verify_code():
    """Step 2: Verify the 6-digit code and create the account."""
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")

    if not email or not code:
        return jsonify({"error": "Email and code are required"}), 400

    pending = pending_verifications.get(email)
    if not pending:
        return jsonify({"error": "No pending verification. Please start over."}), 400

    if pending["code"] != code.strip():
        return jsonify({"error": "Invalid verification code. Please try again."}), 401

    user = User(name=pending["name"], email=email, role=pending["role"])
    user.set_password(pending["password"])
    db.session.add(user)
    db.session.commit()

    del pending_verifications[email]

    login_user(user, remember=True)
    session.permanent = True
    return jsonify(user.to_dict()), 201


@auth_bp.route("/register", methods=["POST"])
def register():
    """Legacy direct register."""
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password") or not data.get("name"):
        return jsonify({"error": "Name, email, and password are required"}), 400
    if not EMAIL_RE.match(data["email"]):
        return jsonify({"error": "Please enter a valid email address"}), 400
    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409
    user = User(name=data["name"], email=data["email"], role=data.get("role", "student"))
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    login_user(user, remember=True)
    session.permanent = True
    return jsonify(user.to_dict()), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400
    if not EMAIL_RE.match(data["email"]):
        return jsonify({"error": "Please enter a valid email address"}), 400
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401
    login_user(user, remember=True)
    session.permanent = True
    return jsonify(user.to_dict()), 200


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"}), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify(current_user.to_dict()), 200
