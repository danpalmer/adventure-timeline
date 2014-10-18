from flask import Flask
from flask import render_template
from flask.ext.admin import Admin
from flask.ext.admin.contrib.peewee import ModelView

from lib.model import Activity, Transaction, Sector, RelatedActivity, db

app = Flask(__name__)
admin = Admin(app)

admin.add_view(ModelView(Activity, db))

db.connect()
db.create_tables((
    Activity, Transaction, Sector, RelatedActivity
), safe=True)

@app.route("/")
def hello():
    activities = Activity.select().where(
        (Activity.date_end_actual != None or Activity.date_end_planned != None) and
        (Activity.date_start_actual != None or Activity.date_start_planned != None) and
        Activity.recipient_country_code != None and
        Activity.recipient_region_code != None
    ).limit(10)
    return render_template('index.html', activities=activities)

if __name__ == "__main__":
    app.run(debug=True)
