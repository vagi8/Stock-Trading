import random
from datetime import datetime

from sqlalchemy import extract, or_, and_

from .. import scheduler
from ..admin.models import db, Stocks, MarketHours, MarketHolidays
from ..auth.models import User
from ..user.models import StockTransaction, LimitTransaction, Portfolio, CashTransaction
from ..user.user import isMarketOpen


def create_market_settings_data():
    if len(MarketHours.query.all()) == 0:
        data = MarketHours(
            startHour=datetime(2022, 3, 28, 9, 30, 0, 0),
            endHour=datetime(2022, 3, 28, 16, 0, 0, 0)
        )
        db.session.add(data)
        db.session.commit()

    # data2 = MarketHolidays(
    #     day=datetime(2022, 3, 28)
    # )
    # db.session.add(data2)
    # db.session.commit()


@scheduler.task('interval', id='job_1', seconds=5, misfire_grace_time=900)
def job1():
    with scheduler.app.app_context():
        current_date = datetime.now()
        market_hours = MarketHours.query.all()
        market_holidays = MarketHolidays.query.with_entities(MarketHolidays.day).filter(
            extract('month', MarketHolidays.day) == current_date.month,
            extract('day', MarketHolidays.day) == current_date.day).all()
        # MarketHolidays.query.with_entities(MarketHolidays.day).filter(
        # extract('month', MarketHolidays.day) >= datetime.today().month,
        # func.extract('dow', MarketHolidays.day) == 6).all()

        # check for weekday, check for time in market hours, check for if today is one of the market holidays
        if current_date.weekday() < 5 and market_hours[0].startHour.time() <= current_date.time() <= market_hours[
            0].endHour.time() and len(market_holidays) == 0:

            inc = random.choice([True, False])
            if inc:
                val = random.uniform(0.0155, 0.795)
            else:
                val = random.uniform(0.0155, 1.295)
            stocks = Stocks.query
            # stocks.update(
            #     dict(currentPrice=Stocks.currentPrice + (val * Stocks.id) if inc else Stocks.currentPrice - (val*Stocks.id),
            #          ))
            for stock in stocks:
                if not inc and round(stock.currentPrice - (val * stock.id), 3) < 0.001:
                    stock.currentPrice = round(stock.currentPrice + (val * stock.id), 3)
                else:
                    stock.currentPrice = round(stock.currentPrice + (val * stock.id), 3) if inc else round(
                        stock.currentPrice - (val * stock.id), 3)
                priceTriggers(stock, current_date)
            db.session.commit()
            print("Stock Price Update at - ", current_date)
        elif not current_date.weekday() < 5:
            print("Stock Market Closed on Weekends")
        elif not market_hours[0].startHour.time() <= current_date.time() <= market_hours[0].endHour.time():
            print("Stock Market open only in admin specified hours")
        else:
            print("Stock Market is closed today as a holiday")


def update_transaction_status(tran_id, status, log):
    new = StockTransaction.query.filter(StockTransaction.id == tran_id).update(
        {StockTransaction.status: status, StockTransaction.log: log, StockTransaction.updatedDateTime: datetime.now()})
    db.session.commit()


def update_cash_transaction(userID, transaction_type, amount, is_credit):
    tran = CashTransaction(
        userID=userID,
        transactionType=transaction_type,
        amount=amount if is_credit else -amount,
        dateTime=datetime.now()
    )
    db.session.add(tran)
    db.session.commit()


def buy_limit(tran):
    # # checking for sufficient balance
    if tran.transaction.user.balance < tran.transaction.stock.currentPrice * tran.transaction.orderVolume:
        update_transaction_status(tran.transactionID, status='Aborted', log='Insufficient Balance')
    else:
        log = ''
        try:
            # update balance
            tran.transaction.user.balance = round(
                tran.transaction.user.balance - (tran.transaction.stock.currentPrice * tran.transaction.orderVolume), 3)
            db.session.commit()
            #         # update portfolio
            #         #     check if already exists current_user.portfolio
            if Portfolio.query.filter_by(userID=tran.transaction.user.id,
                                         stockID=tran.transaction.stock.id).first() is not None:
                row = Portfolio.query.filter_by(userID=tran.transaction.user.id,
                                                stockID=tran.transaction.stock.id).first()

                row.purchasePrice = ((row.units * row.purchasePrice) + (
                        tran.transaction.orderVolume * tran.transaction.stock.currentPrice)) / (
                                            tran.transaction.orderVolume + row.units)
                row.units += tran.transaction.orderVolume
            else:
                portfolio = Portfolio(
                    userID=tran.transaction.user.id,
                    stockID=tran.transaction.stockID,
                    units=tran.transaction.orderVolume,
                    purchasePrice=tran.transaction.stock.currentPrice
                )
                db.session.add(portfolio)

            # update current balance if market
            try:
                update_cash_transaction(tran.transaction.user.id, 'Stock Debit',tran.transaction.stock.currentPrice * tran.transaction.orderVolume, False)
                status = 'executed'
            except Exception as e:
                log=str(e)
                status = 'failed'
        except Exception as e:
            log=str(e)
            status = 'failed'

    update_transaction_status(tran.transactionID, status, log)
    return True


def sell_limit(tran):
    log = ''
    # update portfolio
    #     check if already exists current_user.portfolio
    try:
        if Portfolio.query.filter_by(userID=tran.transaction.userID,
                                     stockID=tran.transaction.stockID).first() is not None:
            row = Portfolio.query.filter_by(userID=tran.transaction.userID, stockID=tran.transaction.stockID).first()
            if row.units < tran.transaction.orderVolume:
                update_transaction_status(tran.transactionID, 'Aborted', 'Excessive order volume than in portfolio')
                return False
            elif row.units == tran.transaction.orderVolume:
                db.session.delete(row)
            else:
                # avg purchase price wont change for this
                row.units -= tran.transaction.orderVolume
        else:
            update_transaction_status(tran.transactionID, 'Aborted', 'Stock not in portfolio')
            return False
        # update current balance if market
        update_cash_transaction(tran.transaction.user.id, 'Stock Credit', tran.transaction.stock.currentPrice * tran.transaction.orderVolume,True)
        tran.transaction.user.balance = round(
            tran.transaction.user.balance + (tran.transaction.stock.currentPrice * tran.transaction.orderVolume), 3)
        db.session.commit()
        status = 'executed'
    except Exception as e:
        log=str(e)
        status = 'failed'

    update_transaction_status(tran.transactionID, status, log)


@scheduler.task('interval', id='job_2', seconds=4, misfire_grace_time=900)
def job2():
    with scheduler.app.app_context():
        if isMarketOpen():
            print('Running Limit order market scheduler')
            transactions = LimitTransaction.query \
                .filter(LimitTransaction.limitExpiry >= datetime.now()) \
                .join(StockTransaction, LimitTransaction.transactionID == StockTransaction.id) \
                .filter(StockTransaction.status == 'open') \
                .join(Stocks, StockTransaction.stockID == Stocks.id) \
                .filter(
                or_(and_(StockTransaction.transactionType == 'Buy', LimitTransaction.limitPrice >= Stocks.currentPrice),
                    and_(StockTransaction.transactionType == 'Sell', LimitTransaction.limitPrice <= Stocks.currentPrice))) \
                .join(User, StockTransaction.userID == User.id)
            for item in transactions.all():
                print("Executing - ", item.transaction.id)
                if item.transaction.transactionType == 'Buy':
                    buy_limit(item)
                else:
                    sell_limit(item)
            abort_transactions = LimitTransaction.query \
                .filter(LimitTransaction.limitExpiry < datetime.now()) \
                .join(StockTransaction, LimitTransaction.transactionID == StockTransaction.id) \
                .filter(StockTransaction.status == 'open')

            for item in abort_transactions.all():
                print("Aborting - ", item.transaction.id)
                update_transaction_status(item.transaction.id, 'Aborted', 'Date expired')

                # buy_transactions.all()[1].transaction.stock.currentPrice .filter(  (StockTransaction.transactionType=='Buy'
            # and LimitTransaction.limitPrice >= Stocks.currentPrice) or (StockTransaction.transactionType=='Sell' and
            # LimitTransaction.limitPrice <= Stocks.currentPrice) )
        else:
            print('Not running Limit order market scheduler')

def priceTriggers(stock, current_date):
    if stock.lastTradedDay is None or stock.lastTradedDay.date() != current_date.date():
        stock.openPrice = stock.currentPrice
        stock.lastTradedDay = current_date
    if stock.dayHigh < stock.currentPrice:
        stock.dayHigh = stock.currentPrice
    if stock.dayLow > stock.currentPrice:
        stock.dayLow = stock.currentPrice
