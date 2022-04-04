import json
from datetime import datetime

import pandas as pd
from flask import Blueprint, render_template, make_response, request, jsonify, redirect, url_for
from flask_login import login_required
from sqlalchemy import extract
from sqlalchemy.exc import IntegrityError

from .forms import CreateStock, UpdateMarketHours, CreateMarketHolidays
from .models import Stocks, db, MarketHours, MarketHolidays

# Blueprint Configuration
admin_bp = Blueprint(
    'admin_bp', __name__,
    template_folder='templates',
    static_folder='static',
    url_prefix='/admin'
)


@admin_bp.route("/dashboard", methods=['GET', 'POST'])
@login_required
def dashboard():
    error = ''
    form = CreateStock()
    marketHoursform = UpdateMarketHours()
    marketHolidaysform = CreateMarketHolidays()
    stocksData = Stocks.query
    marketHours = MarketHours.query.first()
    marketHoursData = {'startHour': marketHours.startHour.time(), 'endHour': marketHours.endHour.time()}
    if request.method == 'POST':
        if form.validate_on_submit():
            stock = Stocks(
                companyName=form.companyName.data,
                ticker=form.ticker.data,
                volume=form.volume.data,
                initialPrice=form.initialPrice.data,
                currentPrice=form.initialPrice.data,
                openPrice=0,
                dayHigh=0,
                dayLow=form.initialPrice.data,
                lastTradedDay=datetime(1990, 1, 1, 0, 0, 0, 0)
            )
            db.session.add(stock)
            try:
                db.session.commit()
            except IntegrityError:
                error = 'Company Name or stock ticker already exists'
                db.session.rollback()

    return render_template("/dashboard.html", error=error, form=form, stocks=stocksData, marketHours=marketHoursData,
                           marketHoursform=marketHoursform, marketHolidaysform=marketHolidaysform)


@admin_bp.route("/get/market_holidays", methods=['GET', 'POST'])
def get_market_holidays():
    holidays = MarketHolidays.query
    holidays_data = pd.read_sql(holidays.statement, holidays.session.bind)
    holidays_data = json.loads(holidays_data.to_json(orient='records'))
    headers = {"Content-Type": "application/json"}
    return make_response(jsonify(holidays_data), 200, headers)


@admin_bp.route("/get/stocks", methods=['GET', 'POST'])
def get_stocks():
    stocks = Stocks.query
    stocks_data = pd.read_sql(stocks.statement, stocks.session.bind)
    stocks_data = json.loads(stocks_data.to_json(orient='records'))
    headers = {"Content-Type": "application/json"}
    return make_response(jsonify(stocks_data), 200, headers)


@admin_bp.route("/get/update_stocks", methods=['GET', 'POST'])
def get_updated_stocks():
    current_date = datetime.now()
    market_hours = MarketHours.query.all()
    market_holidays = MarketHolidays.query.with_entities(MarketHolidays.day).filter(
        extract('month', MarketHolidays.day) == current_date.month,
        extract('day', MarketHolidays.day) == current_date.day).all()
    # check for weekday, check for time in market hours, check for if today is one of the market holidays
    if current_date.weekday() < 5 and market_hours[0].startHour.time() <= current_date.time() <= market_hours[
        0].endHour.time() and len(market_holidays) == 0:
        market = True
        stocks = Stocks.query.with_entities(Stocks.id, Stocks.currentPrice)
        stocks_data = pd.read_sql(stocks.statement, stocks.session.bind)
        stocks_data = json.loads(stocks_data.to_json(orient='records'))
    else:
        market = False
        stocks_data = False

    headers = {"Content-Type": "application/json"}
    return make_response(jsonify({'market': market, 'stocks_data': stocks_data}), 200, headers)


@admin_bp.route("/changeMarketHours", methods=['POST'])
@login_required
def changeMarketHours():
    error = ''
    marketHoursform = UpdateMarketHours()
    marketHours = MarketHours.query.first()
    if request.method == 'POST':
        startHour = marketHoursform.startHour.raw_data[0]
        endHour = marketHoursform.endHour.raw_data[0]
        marketHours.startHour = datetime(2022, 3, 3, int(startHour.split(':')[0]), int(startHour.split(':')[1]), 0, 0)
        marketHours.endHour = datetime(2022, 3, 3, int(endHour.split(':')[0]), int(endHour.split(':')[1]), 0, 0)
        db.session.commit()

    return redirect(url_for('admin_bp.dashboard'))


@admin_bp.route("/post/delete_holiday/<id>", methods=['POST'])
def cancel_transaction(id):
    id = int(id)
    headers = {"Content-Type": "application/json"}
    transaction = MarketHolidays.query.filter(MarketHolidays.id == id)
    if len(transaction.all()) == 0:
        return make_response(jsonify({'Error': 'No such day exists '}), 500, headers)
    elif len(transaction.all()) > 1:
        return make_response(jsonify({'Error': 'Internal error'}), 500, headers)
    else:
        db.session.delete(transaction.first())
        db.session.commit()
        return make_response(jsonify({'Error': 'Deleted'}), 200, headers)


@admin_bp.route("/post/changeMarketHolidays", methods=['POST'])
def changeMarketHoidays():
    error = ''
    marketHolidays = CreateMarketHolidays()
    try:
        if request.method == 'POST':
            print("hello")
            date = marketHolidays.day.raw_data[0].split('-')
            holiday = MarketHolidays(
                day=datetime(int(date[0]), int(date[1]), int(date[2]), 23, 59, 59, 999999)
            )
            db.session.add(holiday)
            db.session.commit()
        headers = {"Content-Type": "application/json"}
        return make_response(jsonify({'message': 'Done'}), 200, headers)
    except Exception as e:
        headers = {"Content-Type": "application/json"}
        return make_response(jsonify({'Error': e}), 500, headers)
