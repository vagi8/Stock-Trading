from flask import Blueprint, render_template,redirect,abort,url_for
from flask import current_app as app
from flask_login import login_required,current_user

# Blueprint Configuration
settings_bp = Blueprint(
    'settings_bp', __name__,
    template_folder='templates',
    static_folder='static'
)


@settings_bp.route("/settings/channels")
#@login_required
def channels():
    return render_template("/SettingChannels.html")

@settings_bp.route("/settings/crops")
#@login_required
def crops():
    return render_template("/SettingCrops.html")

@settings_bp.route("/settings/CampaignGroups")
#@login_required
def groups():
    return render_template("/CampaignGroups.html")

@settings_bp.route("/Settings/users")
#@login_required
def users():
    return render_template("/SettingUsers.html")

@settings_bp.route("/Settings/ContactGroups")
#@login_required
def farmergroups():
    return render_template("/FarmerGroups.html")

@settings_bp.route("/Settings/CropCategory")
#@login_required
def crop_category():
    return render_template("/CropCategory.html")

@settings_bp.route("/Settings/CropSector")
#@login_required
def crop_sector():
    return render_template("/CropSector.html")

@settings_bp.route("/Settings/AppSettings")
#@login_required
def appsetting():
    return render_template("/appsetting.html")
    # return abort(503, '')

@settings_bp.route("/Settings/faqs")
#@login_required
def faqs_list():
    return render_template("/faqs_list.html")

@settings_bp.route("/Settings/faqs/new")
#@login_required
def faqs_new():
    return render_template("/faqs_new.html")

@settings_bp.before_request
def admin_check():
    if current_user.is_authenticated:
        if current_user.role=='Admin':
            pass
        else:
            return abort(403, 'Access Not allowed')
    else:
        return redirect(url_for('auth_bp.login'))


