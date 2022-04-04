"""Sign-up & log-in forms."""
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, IntegerField, FloatField, DateTimeField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional, NumberRange
from .models import *


class CreateStock(FlaskForm):
    """User Sign-up Form."""
    companyName = StringField(
        'Company Name',
        validators=[DataRequired()]
    )
    ticker = StringField(
        'Stock Ticker',
        validators=[DataRequired()]
    )
    volume = IntegerField(
        'Volume',
        validators=[DataRequired()]
    )
    initialPrice = FloatField(
        'Initial Price (USD)',
        validators=[DataRequired()]
    )
    currentPrice = FloatField(
        'Current Price',
        validators=[]
    )

    openPrice = FloatField(
        'open Price'
    )
    dayHigh = FloatField(
        'Day High'
    )
    dayLow = FloatField(
        'Day Low'
    )
    lastTradedDay = DateTimeField(
        'Last Traded Day'
    )
    submit = SubmitField('Create')


class UpdateMarketHours(FlaskForm):
    startHour = DateTimeField(
        'Market Start Hour',
        validators=[DataRequired()]
    )
    endHour = DateTimeField(
        'Market End Hour',
        validators=[DataRequired()]
    )
    submit = SubmitField('Update')


class CreateMarketHolidays(FlaskForm):
    day = DateTimeField(
        'Add Market Holiday',
        validators=[DataRequired()]
    )
    submit = SubmitField('Add Holiday')

