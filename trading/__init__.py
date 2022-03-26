from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
# Globally accessible libraries
db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    """Initialize the core application."""
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object('config.DevConfig')
    # app.config.from_object('config.ProdConfig')

    # Initialize Plugins and DBs, login manager
    db.init_app(app)
    login_manager.init_app(app)

    with app.app_context():
        # Include our Routes
        from .auth import auth
        from .admin import admin
        from .errors import errors
        # Register Blueprints
        app.register_blueprint(auth.auth_bp)
        app.register_blueprint(admin.admin_bp)
        app.register_blueprint(errors.errors_bp)
        db.create_all()
        return app