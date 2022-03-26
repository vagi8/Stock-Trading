from flask import Blueprint, render_template,request,redirect,abort
from flask_login import login_required,current_user
import pandas as pd
# Blueprint Configuration
chat_bp = Blueprint(
    'chat_bp', __name__,
    template_folder='templates',
    static_folder='static'
)

@chat_bp.route("/chat")
#@login_required
def home():
    # return render_template("/CampaignList.html")
    return abort(503, '')
