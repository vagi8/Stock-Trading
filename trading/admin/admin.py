from flask import Blueprint, render_template, make_response, request, jsonify, redirect, url_for
from flask_login import login_required, current_user
from .models import Stocks, db, MarketHours, MarketHolidays
from .forms import CreateStock, UpdateMarketHours, CreateMarketHolidays
from sqlalchemy.exc import IntegrityError
from datetime import datetime

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
            # existing_user = Stocks.query.filter_by(email=form.email.data).first()
            # if existing_user is None:
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
            # return make_response(jsonify({'message': 'ok'}), 200, headers)
            # else:
            # error='User with Email ID already exists'


    return render_template("/dashboard.html", error=error, form=form, stocks=stocksData, marketHours=marketHoursData, marketHoursform=marketHoursform, marketHolidaysform=marketHolidaysform)


@admin_bp.route("/changeMarketHours", methods=['POST'])
@login_required
def changeMarketHours():
    error = ''
    marketHoursform = UpdateMarketHours()
    marketHours = MarketHours.query.first()
    if request.method == 'POST':
        startHour=marketHoursform.startHour.raw_data[0]
        endHour = marketHoursform.endHour.raw_data[0]
        marketHours.startHour=datetime(2022,3,3,int(startHour.split(':')[0]),int(startHour.split(':')[1]),0,0)
        marketHours.endHour=datetime(2022,3,3,int(endHour.split(':')[0]),int(endHour.split(':')[1]),0,0)
        db.session.commit()

    return redirect(url_for('admin_bp.dashboard'))


@admin_bp.route("/changeMarketHolidays", methods=['POST'])
@login_required
def changeMarketHoidays():
    error = ''
    marketHoursform = UpdateMarketHours()
    marketHours = MarketHours.query.first()
    if request.method == 'POST':
        marketHours.startHour=''
        marketHours.endHour=''
        db.session.commit()

    return redirect(url_for('admin_bp.dashboard'))
