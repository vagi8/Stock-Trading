from flask import Blueprint, render_template
from flask_login import login_required,current_user

# Blueprint Configuration
dashboard_bp = Blueprint(
    'dashboard_bp', __name__,
    template_folder='templates',
    static_folder='static'
)

@dashboard_bp.route("/dashboard/bot-analytics")
#@login_required
def bot_analytics():
    return render_template("/bot_analytics.html")

@dashboard_bp.route("/dashboard")
#@login_required
def dashboard():
    return render_template("/userDashboard.html")
