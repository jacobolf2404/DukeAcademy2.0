from flask import Flask
from app.config import Config
from app.extensions import db, migrate, login_manager, bcrypt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, supports_credentials=True, origins=["http://localhost:5173"])

    # Login manager config
    login_manager.login_view = None  # API-only, no redirect

    @login_manager.user_loader
    def load_user(user_id):
        from app.models.user import User
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return {"error": "Authentication required"}, 401

    # Register blueprints
    from app.routes import (
        auth_bp,
        courses_bp,
        enrollments_bp,
        assignments_bp,
        submissions_bp,
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(enrollments_bp)
    app.register_blueprint(assignments_bp)
    app.register_blueprint(submissions_bp)

    # Create tables (for dev convenience)
    with app.app_context():
        from app.models import User, Course, Enrollment, Assignment, Submission  # noqa
        db.create_all()

    return app


app = create_app()
