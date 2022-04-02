"""Database models."""
# from flask_sqlalchemy import SQLAlchemy
from .. import db


class Stocks(db.Model):
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


class MarketHours(db.Model):
    __tablename__ = "market_hours"
    id = db.Column(
        db.Integer,
        primary_key=True
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
