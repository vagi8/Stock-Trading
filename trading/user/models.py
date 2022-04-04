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
        nullable=False,
        index=True
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
    user = db.relationship('User', backref='cashTransactions', lazy=True)


class StockTransaction(db.Model):
    __tablename__ = 'stock_transaction'
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    userID = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False,
        index=True
    )
    stockID = db.Column(
        db.Integer,
        db.ForeignKey('stocks.id'),
        nullable=False,
        index=True
    )
    transactionType = db.Column(
        db.String(10),
        nullable=False
    )
    orderType = db.Column(
        db.String(10),
        nullable=False
    )
    orderVolume = db.Column(
        db.Integer,
        unique=False,
        nullable=False
    )
    status = db.Column(
        db.String(10),
        nullable=False,
        unique=False
    )
    log = db.Column(
        db.String(255),
        nullable=True,
    )
    createdDateTime = db.Column(
        db.DateTime,
        default=db.func.now(),
        unique=False,
        nullable=False
    )
    updatedDateTime = db.Column(
        db.DateTime,
        default=db.func.now(),
        unique=False,
        nullable=False
    )

    # relations
    user = db.relationship('User', backref='stockTransactions', lazy=True)
    stock = db.relationship('Stocks', backref='transactions', lazy=True)


class LimitTransaction(db.Model):
    __tablename__ = "limit_transaction"
    id = db.Column(
        db.Integer,
        primary_key=True,
    )
    transactionID = db.Column(
        db.Integer,
        db.ForeignKey('stock_transaction.id'),
        nullable=False,
        index=True
    )
    limitPrice = db.Column(
        db.Integer,
        nullable=False
    )
    limitExpiry = db.Column(
        db.DateTime,
        nullable=False
    )
    transaction = db.relationship('StockTransaction', backref='limitOrders', lazy=True)
