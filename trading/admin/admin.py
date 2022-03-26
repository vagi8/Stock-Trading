from flask import Blueprint, render_template, make_response, request, jsonify
from flask_login import login_required,current_user
from .models import Stocks, db
from .forms import CreateStock
from sqlalchemy.exc import IntegrityError
# Blueprint Configuration
admin_bp = Blueprint(
    'admin_bp', __name__,
    template_folder='templates',
    static_folder='static',
    url_prefix='/admin'
)

@admin_bp.route("/dashboard",methods=['GET', 'POST'])
@login_required
def dashboard():
    error=''
    form = CreateStock()
    stocksData=Stocks.query
    if request.method=='POST':
        if form.validate_on_submit():
            # existing_user = Stocks.query.filter_by(email=form.email.data).first()
            # if existing_user is None:
            stock = Stocks(
                companyName=form.companyName.data,
                ticker=form.ticker.data,
                volume=form.volume.data,
                initialPrice=form.initialPrice.data,
                currentPrice=form.initialPrice.data
            )
            db.session.add(stock)
            try:
                db.session.commit()
            except IntegrityError:
                error='Company Name or stock ticker already exists'
                db.session.rollback()
            # return make_response(jsonify({'message': 'ok'}), 200, headers)
            # else:
                # error='User with Email ID already exists'
    return render_template("/dashboard.html",error=error,form=form,stocks=stocksData)

