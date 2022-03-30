"""Sign-up & log-in forms."""
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, IntegerField, FloatField, DateTimeField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional, NumberRange
from .models import *
import datetime


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
        choices=[('Deposit', 'Deposit'), ('Withdraw', 'Withdraw')]
    )
    amount = IntegerField(
        'Amount (USD)',
        validators=[DataRequired()]
    )
    dateTime = DateTimeField(
        'Transaction Date Time'
    )

    submit = SubmitField('Submit')
