from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_apscheduler import APScheduler

# Globally accessible libraries
db = SQLAlchemy()
login_manager = LoginManager()
scheduler = APScheduler()

def create_app():
    """Initialize the core application."""
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object('config.DevConfig')
    # app.config.from_object('config.ProdConfig')

    # Initialize Plugins and DBs, login manager
    db.init_app(app)
    login_manager.init_app(app)

    # initializing schedulers
    scheduler.init_app(app)
    scheduler.start()

    with app.app_context():
        # Include our Routes
        from .auth import auth
        from .admin import admin
        from .user import user

        from .errors import errors
        # Register Blueprints
        app.register_blueprint(auth.auth_bp)
        app.register_blueprint(admin.admin_bp)
        app.register_blueprint(user.user_bp)
        app.register_blueprint(errors.errors_bp)

        # creating db tables
        db.create_all()

        @app.before_first_request
        def create_market_settings():
            from .price_generator import price_generator
            price_generator.create_market_settings_data()

        return app
