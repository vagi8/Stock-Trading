from flask import Blueprint, render_template,request,abort
from flask_login import login_required,current_user
from .. import controller
import pandas as pd
# Blueprint Configuration
campaign_bp = Blueprint(
    'campaign_bp', __name__,
    template_folder='templates',
    static_folder='static'
)

@campaign_bp.route("/Campaign/List")
#@login_required
def home():
    return render_template("/CampaignList.html")

@campaign_bp.route("/Campaign/New")
#@login_required
def create():
    return render_template("/CampaignNew.html", campid="0")

@campaign_bp.route("/Campaign/Edit/<campid>")
#@login_required
def edit(campid):
    if controller.controller.check_edit_campaign(campid):
        return render_template("/CampaignNew.html" , campid=campid)
    else:
        return abort(403, 'Access Not allowed')

@campaign_bp.route("/Campaign/BroadcastLog")
#@login_required
def broadcast_list():
    return render_template("/CampaignBroadcast.html")