from flask import Blueprint, render_template
from flask import current_app as app

# Blueprint Configuration
errors_bp = Blueprint(
    'errors_bp', __name__,
    template_folder='templates',
    static_folder='static'
)


@app.errorhandler(400)
def error_400(e):
    return render_template('/error_400.html')


@app.errorhandler(404)
def error_404(e):
    return render_template('/error_404.html')


@app.errorhandler(403)
def error_403(e):
    return render_template('/error_403.html')


@app.errorhandler(500)
def error_500(e):
    return render_template('/error_500.html')


@app.errorhandler(503)
def maintenance(e):
    return render_template('/error_maintenance.html')
