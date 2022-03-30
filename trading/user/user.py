from flask import Blueprint, render_template, make_response, request, jsonify, redirect, url_for
from flask_login import login_required, current_user
from sqlalchemy.exc import IntegrityError
from .models import Portfolio, CashTransaction, db
from .forms import AddToPortfolio, AddCashTran
from ..admin.models import Stocks
import datetime
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
    portfolio = Portfolio.query
    return render_template("/userDashboard.html", balance=current_user.balance, portfolio=portfolio)


@user_bp.route("/cash", methods=['GET', 'POST'])
@login_required
def cash():
    form = AddCashTran()
    error="" if request.args.get('error') is None else request.args.get('error')
    return render_template("/cash.html", balance=current_user.balance, form=form, error=error)


@user_bp.route("/cashDeposit", methods=['GET', 'POST'])
@login_required
def cashdeposit():
    form = AddCashTran()
    error=''
    if request.method == 'POST':
        form.transactionType.data = 'Deposit'
        if form.validate_on_submit():
            tran = CashTransaction(
                userID=current_user.id,
                transactionType=form.transactionType.data,
                amount=form.amount.data,
                dateTime=datetime.datetime.now()
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
    return redirect(url_for('user_bp.cash',error=error))


@user_bp.route("/cashWithdraw", methods=['GET', 'POST'])
@login_required
def cashwithdraw():
    form = AddCashTran()
    error=''
    if request.method == 'POST':
        form.transactionType.data = 'Withdraw'
        if form.validate_on_submit():
            if current_user.balance < form.amount.data:
                error='Cannot withdraw more than available cash'
            else:
                tran = CashTransaction(
                    userID=current_user.id,
                    transactionType=form.transactionType.data,
                    amount=-form.amount.data,
                    dateTime=datetime.datetime.now()
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
    return redirect(url_for('user_bp.cash',error=error))


@user_bp.route("/ViewStocks", methods=['GET','POST'])
@login_required
def viewstocks():
    stocksData = Stocks.query
    return render_template("/stocks.html", stocks=stocksData)
