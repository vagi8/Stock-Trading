from flask import Blueprint, render_template,request
from flask_login import login_required,current_user
from .. import controller
import pandas as pd
# Blueprint Configuration
reports_bp = Blueprint(
    'reports_bp', __name__,
    template_folder='templates',
    static_folder='static'
)

@reports_bp.route("/reports/Contacts")
#@login_required
def farmers():
    return render_template("/Farmers.html")

@reports_bp.route("/reports/messages")
#@login_required
def messages():
    return render_template("/Messages.html")

@reports_bp.route("/reports/tickets")
#@login_required
def tickets():
    return render_template("/Tickets.html")