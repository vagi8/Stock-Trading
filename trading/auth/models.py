"""Database models."""
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

# from flask_sqlalchemy import SQLAlchemy
from .. import db


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    name = db.Column(
        db.String(100),
        nullable=False,
        unique=False
    )
    username = db.Column(
        db.String(100),
        nullable=False,
        unique=False
    )
    email = db.Column(
        db.String(40),
        unique=True,
        nullable=False
    )
    password = db.Column(
        db.String(200),
        primary_key=False,
        unique=False,
        nullable=False
    )
    balance = db.Column(
        db.Integer,
        primary_key=False,
        unique=False,
        nullable=True
    )
    role = db.Column(
        db.String(40),
        primary_key=False,
        unique=False,
        nullable=False
    )

    def set_password(self, password):
        """Create hashed password."""
        self.password = generate_password_hash(
            password,
            method='sha256'
        )

    def set_name(self, name):
        self.name = name

    def set_role(self, role):
        self.role = role

    def set_status(self, status):
        self.Status = status

    def check_password(self, password):
        """Check hashed password."""
        return check_password_hash(self.password, password)

    def __repr__(self):
        return '<User {}>'.format(self.username)
