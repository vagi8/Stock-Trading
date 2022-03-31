"""Database models."""
# from flask_sqlalchemy import SQLAlchemy
from .. import db


class MarketHours(db.Model):
    __tablename__ = "market_hours"
    id = db.Column(
        db.Integer,
        primary_key = True
    )
    startHour = db.Column(
        db.DateTime,
        primary_key=False,
        unique=False,
        nullable=True
    )
    endHour = db.Column(
        db.DateTime,
        primary_key=False,
        unique=False,
        nullable=True
    )


class MarketHolidays(db.Model):
    __tablename__ = "market_hoidays"
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    day = db.Column(
        db.Date,
        primary_key=False,
        unique=False,
        nullable=True
    )
