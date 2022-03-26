from flask import Blueprint, render_template, make_response, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy.exc import IntegrityError

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
    return render_template("/dashboard.html")
