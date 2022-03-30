"""Database models."""
# from flask_sqlalchemy import SQLAlchemy
from .. import db


class Portfolio(db.Model):
    __tablename__ = 'portfolio'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    userID = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )
    stockID = db.Column(
        db.Integer,
        db.ForeignKey('stocks.id'),
        nullable=False
    )
    units = db.Column(
        db.Integer,
        unique=False,
        nullable=False
    )
    purchasePrice = db.Column(
        db.Float,
        unique=False,
        nullable=False
    )

    # relations
    user = db.relationship('User', backref='portfolio', lazy=True)
    stock = db.relationship('Stocks', backref='portfolio', lazy=True)


class CashTransaction(db.Model):
    __tablename__ = 'cash_transaction'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    userID = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )
    transactionType = db.Column(
        db.String(10),
        nullable=False
    )
    amount = db.Column(
        db.Integer,
        unique=False,
        nullable=False
    )
    dateTime = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        unique=False,
        nullable=False
    )

    # relations
    user = db.relationship('User', backref='cash', lazy=True)
