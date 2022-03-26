"""Database models."""
# from flask_sqlalchemy import SQLAlchemy
from .. import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


class Stocks(UserMixin, db.Model):
    __tablename__ = 'stocks'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    companyName = db.Column(
        db.String(100),
        nullable=False,
        unique=True
    )
    ticker = db.Column(
        db.String(10),
        nullable=False,
        unique=True
    )
    volume = db.Column(
        db.Integer,
        unique=False,
        nullable=False
    )
    initialPrice = db.Column(
        db.Float,
        primary_key=False,
        unique=False,
        nullable=False
    )
    currentPrice = db.Column(
        db.Float,
        primary_key=False,
        unique=False,
        nullable=True
    )
    openPrice = db.Column(
        db.Float,
        primary_key=False,
        unique=False,
        nullable=True

    )
    dayHigh = db.Column(
        db.Float,
        primary_key=False,
        unique=False,
        nullable=True
    )
    dayLow = db.Column(
        db.Float,
        primary_key=False,
        unique=False,
        nullable=True
    )
    lastTradedDay = db.Column(
        db.DateTime,
        primary_key=False,
        unique=False,
        nullable=True
    )