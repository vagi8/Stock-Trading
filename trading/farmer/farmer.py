from flask import Blueprint, render_template,send_file,request
from flask import current_app as app
from flask_login import login_required,current_user
from werkzeug.utils import secure_filename
import os
os.makedirs(os.path.join(app.instance_path, 'FarmersExcels'), exist_ok=True)
# Blueprint Configuration
farmer_bp = Blueprint(
    'farmer_bp', __name__,
    template_folder='templates',
    static_folder='static'
)

@farmer_bp.route("/Contacts/List", methods=['GET','POST'])
#@login_required
def lists():
    return render_template("/FarmersList.html")

@farmer_bp.route("/Contacts/farmers_template.xlsx", methods=['GET'])
#@login_required
def DownloadTemplate():
    return send_file(os.getcwd()+'/instance/farmers_template.xlsx', attachment_filename='Farmers_Template.csv')

@farmer_bp.route("/Contacts/Channels")
#@login_required
def channels():
    return render_template("/FarmersChannels.html")

@farmer_bp.route("/Contacts/Crops")
#@login_required
def crops():
    return render_template("/FarmersCrops.html")

@farmer_bp.route("/Contacts/Lands")
#@login_required
def lands():
    return render_template("/FarmersLands.html")

