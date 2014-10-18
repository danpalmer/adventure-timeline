Create a database called iati_data in Postgres, or modify `lib/model.py` to point to an SQLite database and then run python app.py

To get the data, use [okfn/iatitools](https://github.com/okfn/iatitools) scripts, stages 1 and 2, to download the data (~1.8GB) and create a SQLite database. The only data missing will be the countries table which must be created manually using `db.create_tables((Country,))`, and populated using `countries_data.json`.
