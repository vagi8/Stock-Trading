import json
from datetime import datetime

import pandas as pd
from flask import Blueprint, render_template, make_response, request, jsonify, redirect, url_for
from flask_login import login_required, current_user
from sqlalchemy import extract
from sqlalchemy.exc import IntegrityError

from .forms import AddCashTran, BuySellLimit
from .models import Portfolio, CashTransaction, db, StockTransaction, LimitTransaction
from ..admin.models import Stocks, MarketHours, MarketHolidays

# Blueprint Configuration
user_bp = Blueprint(
    'user_bp', __name__,
    template_folder='templates',
    static_folder='static',
    url_prefix='/user'
)


@user_bp.route("/dashboard", methods=['GET', 'POST'])
@login_required
def dashboard():
    portfolio = Portfolio.query.join(Stocks, Portfolio.stockID == Stocks.id)
    return render_template("/userDashboard.html", balance=current_user.balance, portfolio=portfolio)


@user_bp.route("/transaction_history", methods=['GET', 'POST'])
@login_required
def transaction_history():
    # transactions = StockTransaction.query.filter(StockTransaction.userID==current_user.id).join(LimitTransaction, LimitTransaction.transactionID==StockTransaction.id, isouter=True).join(Stocks, StockTransaction.stockID==Stocks.id, isouter=True)
    # cash_tran=current_user.cashTransactions
    return render_template("/transactions.html", userID=current_user.id)


@user_bp.route("/get/portfolio", methods=['GET'])
def get_portfolio():
    portfolio = Portfolio.query.join(Stocks, Portfolio.stockID == Stocks.id).with_entities(Portfolio.id,
                                                                                           Stocks.companyName,
                                                                                           Stocks.ticker,
                                                                                           Portfolio.units,
                                                                                           Portfolio.purchasePrice)
    portfolio_data = pd.read_sql(portfolio.statement, portfolio.session.bind)
    portfolio_data = json.loads(portfolio_data.to_json(orient='records'))
    headers = {"Content-Type": "application/json"}
    return make_response(jsonify(portfolio_data), 200, headers)


@user_bp.route("/get/transaction_history/<userid>", methods=['GET'])
def get_transaction_history(userid):
    transactions = StockTransaction.query.filter(StockTransaction.userID == int(userid)) \
        .join(LimitTransaction, LimitTransaction.transactionID == StockTransaction.id, isouter=True) \
        .join(Stocks, StockTransaction.stockID == Stocks.id, isouter=True) \
        .with_entities(StockTransaction.id, Stocks.ticker, StockTransaction.transactionType,
                       StockTransaction.orderVolume, StockTransaction.orderType, StockTransaction.status,
                       StockTransaction.log, LimitTransaction.limitPrice, LimitTransaction.limitExpiry)
    transactions_data = pd.read_sql(transactions.statement, transactions.session.bind)
    transactions_data = json.loads(transactions_data.to_json(orient='records'))
    headers = {"Content-Type": "application/json"}
    return make_response(jsonify(transactions_data), 200, headers)


@user_bp.route("/get/cash_history/<userid>", methods=['GET'])
def get_cash_history(userid):
    cash = CashTransaction.query.filter(CashTransaction.userID == int(userid)).with_entities(CashTransaction.id,
                                                                                             CashTransaction.transactionType,
                                                                                             CashTransaction.amount,
                                                                                             CashTransaction.dateTime)
    cash_data = pd.read_sql(cash.statement, cash.session.bind)
    cash_data = json.loads(cash_data.to_json(orient='records'))
    headers = {"Content-Type": "application/json"}
    return make_response(jsonify(cash_data), 200, headers)


@user_bp.route("/post/cancel_transaction/<tranid>", methods=['POST'])
def cancel_transaction(tranid):
    tranid = int(tranid)
    headers = {"Content-Type": "application/json"}
    transaction = LimitTransaction.query.filter(LimitTransaction.transactionID == tranid)
    if len(transaction.all()) == 0:
        return make_response(jsonify({'Error': 'No such limit order exists '}), 500, headers)
    elif len(transaction.all()) > 1:
        return make_response(jsonify({'Error': 'Internal error'}), 500, headers)
    else:
        StockTransaction.query.filter(StockTransaction.id == tranid).update(
            {StockTransaction.status: 'cancelled', StockTransaction.log: 'Cancelled by user'})
        db.session.commit()
        return make_response(jsonify({'Error': 'Order has been cancelled'}), 200, headers)


@user_bp.route("/cash", methods=['GET'])
@login_required
def cash():
    form = AddCashTran()
    error = "" if request.args.get('error') is None else request.args.get('error')
    return render_template("/cash.html", balance=current_user.balance, form=form, error=error)


@user_bp.route("/cashDeposit", methods=['POST'])
@login_required
def cashdeposit():
    form = AddCashTran()
    error = ''
    if request.method == 'POST':
        form.transactionType.data = 'Cash Deposit'
        if form.validate_on_submit():
            tran = CashTransaction(
                userID=current_user.id,
                transactionType=form.transactionType.data,
                amount=form.amount.data,
                dateTime=datetime.now()
            )
            db.session.add(tran)
            old_bal = current_user.balance
            try:
                current_user.balance += form.amount.data
                db.session.commit()
            except Exception as e:
                error = 'Update Failed'
                print("Exception ", e)
                db.session.rollback()
                current_user.balance = old_bal
                db.session.commit()
    return redirect(url_for('user_bp.cash', error=error))


@user_bp.route("/cashWithdraw", methods=['POST'])
@login_required
def cashwithdraw():
    form = AddCashTran()
    error = ''
    if request.method == 'POST':
        form.transactionType.data = 'Cash Withdraw'
        if form.validate_on_submit():
            if current_user.balance < form.amount.data:
                error = 'Cannot withdraw more than available cash'
            else:
                tran = CashTransaction(
                    userID=current_user.id,
                    transactionType=form.transactionType.data,
                    amount=-form.amount.data,
                    dateTime=datetime.now()
                )
                db.session.add(tran)
                old_bal = current_user.balance
                try:
                    current_user.balance -= form.amount.data
                    db.session.commit()
                except IntegrityError:
                    error = 'Company Name or stock ticker already exists'
                    db.session.rollback()
                    current_user.balance = old_bal
                    db.session.commit()
    return redirect(url_for('user_bp.cash', error=error))


@user_bp.route("/ViewStocks", methods=['GET', 'POST'])
@login_required
def viewstocks():
    stocksData = Stocks.query
    return render_template("/stocks.html", stocks=stocksData)


@user_bp.route("/buy_sell", methods=['GET'])
@login_required
def buy_sell():
    form = BuySellLimit()
    error = ''
    return render_template('/buy_sell.html', error=error, balance=current_user.balance, form=form)


def update_cash_transaction(transaction_type, amount, is_credit):
    tran = CashTransaction(
        userID=current_user.id,
        transactionType=transaction_type,
        amount=amount if is_credit else -amount,
        dateTime=datetime.now()
    )
    db.session.add(tran)
    db.session.commit()


def create_market_order(form):
    headers = {"Content-Type": "application/json"}

    # checking for sufficient balance
    if form.transactionType.data == 'Buy' and current_user.balance < form.stockID.data.currentPrice * form.orderVolume.data:
        return make_response(jsonify({'Error': 'Insufficient Balance'}), 500, headers)

    # update transaction/ market / limit
    # will be done at the end based on status
    status = 'open'
    log = ''
    try:
        if form.transactionType.data == 'Buy':
            # update portfolio
            #     check if already exists current_user.portfolio
            if Portfolio.query.filter_by(userID=current_user.id, stockID=form.stockID.data.id).first() is not None:
                row = Portfolio.query.filter_by(userID=current_user.id, stockID=form.stockID.data.id).first()

                row.purchasePrice = ((row.units * row.purchasePrice) + (
                        form.orderVolume.data * form.stockID.data.currentPrice)) / (
                                            form.orderVolume.data + row.units)
                row.units += form.orderVolume.data
            else:
                portfolio = Portfolio(
                    userID=current_user.id,
                    stockID=form.stockID.data.id,
                    units=form.orderVolume.data,
                    purchasePrice=form.stockID.data.currentPrice
                )
                db.session.add(portfolio)

            # update current balance if market
            try:
                update_cash_transaction('Stock Debit', form.stockID.data.currentPrice * form.orderVolume.data, False)
                current_user.balance = round(
                    current_user.balance - (form.stockID.data.currentPrice * form.orderVolume.data), 3)
                status = 'executed'
            except Exception as e:
                log = str(e)
                status = 'failed'

        elif form.transactionType.data == 'Sell':
            # update portfolio
            #     check if already exists current_user.portfolio
            if Portfolio.query.filter_by(userID=current_user.id, stockID=form.stockID.data.id).first() is not None:
                row = Portfolio.query.filter_by(userID=current_user.id, stockID=form.stockID.data.id).first()
                if row.units < form.orderVolume.data:
                    return make_response(jsonify({'Error': 'Excessive units than in portfolio cannot be sold'}), 500,
                                         headers)
                elif row.units == form.orderVolume.data:
                    db.session.delete(row)
                else:
                    # avg purchase price wont change for this
                    row.units -= form.orderVolume.data
            else:
                return make_response(jsonify({'Error': 'Stock Not in your portfolio'}), 500, headers)

            # update current balance if market

            try:
                update_cash_transaction('Stock Credit', form.stockID.data.currentPrice * form.orderVolume.data, True)
                current_user.balance = round(
                    current_user.balance + (form.stockID.data.currentPrice * form.orderVolume.data), 3)
                status = 'executed'
            except Exception as e:
                log = str(e)
                status = 'failed'

        else:
            return make_response(jsonify({'Error': 'Invalid Transaction Type'}), 200, headers)
    except Exception as e:
        log = str(e)
        status = 'failed'

    tran = StockTransaction(
        userID=current_user.id,
        stockID=form.stockID.data.id,
        transactionType=form.transactionType.data,
        orderType=form.orderType.data,
        orderVolume=form.orderVolume.data,
        status=status,
        log=log,
        createdDateTime=datetime.now(),
        updatedDateTime=datetime.now()
    )
    db.session.add(tran)
    db.session.commit()

    return make_response(jsonify({'Success': 'ok'}), 200, headers)


def create_limit_order(form):
    headers = {"Content-Type": "application/json"}

    # checking for sufficient balance
    if form.transactionType.data == 'Buy' and current_user.balance < form.limitPrice.data * form.orderVolume.data:
        return make_response(jsonify({'Error': 'Insufficient Balance'}), 500, headers)
    elif form.transactionType.data == 'Sell':
        row = Portfolio.query.filter_by(userID=current_user.id, stockID=form.stockID.data.id).first()
        if row is None:
            return make_response(jsonify({'Error': 'Stock not in Portfolio'}), 500, headers)
        elif row.units < form.orderVolume.data:
            return make_response(jsonify({'Error': 'Excessive units than in portfolio cannot be sold'}), 500, headers)

    # update transaction/ market / limit
    # will be done at the end based on status
    status = 'open'
    log = 'will be triggered at limit price'

    tran = StockTransaction(
        userID=current_user.id,
        stockID=form.stockID.data.id,
        transactionType=form.transactionType.data,
        orderType=form.orderType.data,
        orderVolume=form.orderVolume.data,
        status=status,
        log=log,
        createdDateTime=datetime.now(),
        updatedDateTime=datetime.now()
    )
    db.session.add(tran)
    db.session.flush()
    db.session.refresh(tran)
    date = form.limitExpiry.raw_data[0].split('-')
    limitTran = LimitTransaction(
        transactionID=tran.id,
        limitPrice=form.limitPrice.data,
        limitExpiry=datetime(int(date[0]), int(date[1]), int(date[2]), 23, 59, 59, 999999)
    )
    db.session.add(limitTran)
    db.session.commit()

    return make_response(jsonify({'Success': 'ok'}), 200, headers)


@user_bp.route("/post/buy_sell", methods=['POST'])
def post_buy_sell():
    headers = {"Content-Type": "application/json"}
    print("form recieved")
    form = BuySellLimit()
    if form.orderType.data == 'Market':
        if isMarketOpen():
            return create_market_order(form)
        else:
            return make_response(jsonify({'Error': 'Market is currently closed'}), 500, headers)
    elif form.orderType.data == 'Limit':
        return create_limit_order(form)
    else:
        return make_response(jsonify({'Error': 'Invalid Order Type'}), 500, headers)


def isMarketOpen():
    current_date = datetime.now()
    market_hours = MarketHours.query.all()
    market_holidays = MarketHolidays.query.with_entities(MarketHolidays.day).filter(
        extract('month', MarketHolidays.day) == current_date.month,
        extract('day', MarketHolidays.day) == current_date.day).all()
    # check for weekday, check for time in market hours, check for if today is one of the market holidays
    if current_date.weekday() < 5 and market_hours[0].startHour.time() <= current_date.time() <= market_hours[
        0].endHour.time() and len(market_holidays) == 0:
        return True
    else:
        return False
