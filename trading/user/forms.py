"""Sign-up & log-in forms."""
from flask_wtf import FlaskForm
from wtforms import SubmitField, SelectField, IntegerField, FloatField, DateTimeField, RadioField
from wtforms.ext.sqlalchemy.fields import QuerySelectField
from wtforms.validators import DataRequired, NumberRange

from ..admin.models import Stocks


class AddToPortfolio(FlaskForm):
    userID = IntegerField(
        'User',
        validators=[DataRequired()]
    )
    stockID = IntegerField(
        'Stock',
        validators=[DataRequired()]
    )
    units = IntegerField(
        'Units',
        validators=[DataRequired()]
    )
    purchasePrice = FloatField(
        'Purchase Price',
        validators=[DataRequired()]
    )

    submit = SubmitField('Create')


class AddCashTran(FlaskForm):
    userID = IntegerField(
        'Company Name'
    )
    transactionType = SelectField(
        'Type',
        # choices=[('Deposit', 'Deposit'), ('Withdraw', 'Withdraw')]
        choices=[('Cash Deposit', 'Cash Deposit'), ('Cash Withdraw', 'Cash Withdraw')]
    )
    amount = IntegerField(
        'Amount (USD)',
        validators=[DataRequired()]
    )
    dateTime = DateTimeField(
        'Transaction Date Time'
    )

    submit = SubmitField('Submit')


class BuySellMarket(FlaskForm):
    stockID = QuerySelectField(
        'Stocks',
        query_factory=lambda: Stocks.query,
        get_pk=lambda a: a.id,
        get_label=lambda a: a.ticker,
        validators=[DataRequired()]
    )
    orderVolume = IntegerField(
        'No of Units',
        validators=[DataRequired()]
    )
    transactionType = SelectField(
        'Buy/Sell',
        choices=[('Buy', 'Buy'), ('Sell', 'Sell')]
    )
    orderType = SelectField(
        'Order Type',
        choices=[('Market', 'Market'), ('Limit', 'Limit')]
    )
    submit = SubmitField('Buy/Sell')


class BuySellLimit(FlaskForm):
    stockID = QuerySelectField(
        'Stocks',
        query_factory=lambda: Stocks.query,
        get_pk=lambda a: a.id,
        get_label=lambda a: a.ticker,
        validators=[DataRequired()]
    )
    orderVolume = IntegerField(
        'No of Units',
        validators=[DataRequired(), NumberRange(min=1, message="Minimum of one stock for a valid transaction")]
    )
    transactionType = SelectField(
        'Buy/Sell',
        choices=[('Buy', 'Buy '), ('Sell', 'Sell')]
    )
    orderType = RadioField(
        'Order Type',
        choices=[('Market', 'Market'), ('Limit', 'Limit')]
    )
    limitPrice = FloatField(
        'Limit Price',
        validators=[NumberRange(min=0.001, message="Minimum of 0.001 is the limit price")]
    )
    limitExpiry = DateTimeField(
        'Limit Order Expiry'
    )
    submit = SubmitField('Submit Order')
