import os

from flask import Flask, jsonify, request, abort
from flask import render_template
from flask.ext.admin import Admin
from flask.ext.admin.contrib.peewee import ModelView

from lib.model import db, Activity, Transaction, Sector, RelatedActivity, \
    Country

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
    code = request.args.get('country_code')
    if not code:
        abort(404)

    country = Country.get(Country.three_char_iso_code==code)

    qs = Activity.select().where(
        Activity.recipient_country_code==country.two_char_iso_code,
    )

    activities = []
    for activity in qs:
        activities.append({
            'id': activity.id,
            'content': activity.title,
            'description': activity.description,
            'start': activity.get_start(),
            'end': activity.get_end(),
            'uri': activity.activity_website,
            'country_code': activity.recipient_country_code,
        })

    activities = [
        x for x in activities if all(x[y] for y in x.keys())
    ]

    limit = request.args.get('limit')
    if limit:
        activities = activities[:int(limit)]

    return jsonify(results=activities, length=len(activities))

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
