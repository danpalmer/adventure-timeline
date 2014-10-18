import os

from flask import Flask, jsonify, request, abort
from flask import render_template
from flask.ext.admin import Admin
from flask.ext.admin.contrib.peewee import ModelView

from lib.model import db, Activity, Transaction, Sector, RelatedActivity, \
    Country
from lib.sectors import get_sector, SECTORS

app = Flask(__name__)

# Admin interface
admin = Admin(app)
admin.add_view(ModelView(Activity, db))

# Set up database
db.connect()
db.create_tables((
    Activity, Transaction, Sector, RelatedActivity
), safe=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static')
def static_proxy(path):
    return app.send_static_file(os.path.join('static', path))

@app.route('/query')
def query():
    country_code = request.args.get('country_code')
    if not country_code:
        abort(404)

    country = Country.get(Country.three_char_iso_code==country_code)

    qs = Activity.select(Activity, Sector).join(
        Sector,
        on=(Activity.iati_identifier==Sector.activity_iati_identifier),
    ).where(
        Activity.recipient_country_code==country.two_char_iso_code,
    ).naive()

    sector_code = request.args.get('sector')
    if sector_code:
        qs = qs.where(Sector.code==sector_code)

    activities = {}
    for activity in qs:
        if not activity.code:
            continue
        try:
            sector_name, sector_description = get_sector(activity.code)
        except KeyError:
            continue
        activities[activity.iati_identifier] = {
            'id': activity.id,
            'title': activity.title,
            'description': activity.description,
            'status': activity.status,
            'sector': {
                'name': sector_name,
                'description': sector_description,
            },
            'start': activity.get_start(),
            'end': activity.get_end(),
            'uri': activity.activity_website,
            'country_code': activity.recipient_country_code,
            'iati_id': activity.iati_identifier,
        }

    activities = list(activities.values())

    return jsonify(results=activities, length=len(activities))

@app.route('/sectors')
def sectors():
    return jsonify(sectors=[(x, y[0]) for x, y in SECTORS.items()])

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
