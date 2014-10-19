import requests
import json
import time

#get list of countries
country_list =[]

data = requests.get('http://api.worldbank.org/countries/?format=json&per_page=1000')
countries = data.json()[1]

for country in countries:
    country_list.append({
        'id':country['id'],
        'name':country['name']
    })

#save country list
with open('wb_export1/countries.json', 'w') as fp:
    json.dump(country_list, fp)

#get list of indicators
indicator_list = []

data = requests.get('http://api.worldbank.org/indicators/?format=json&per_page=13074')
#data = requests.get('http://api.worldbank.org/indicators/?format=json')

indicators = data.json()[1]
for indicator in indicators:
    print 'Downloading:' + indicator['name']
    indicator_list.append({
        indicator['id']: {
            'name': indicator['name'],
            "relation": "of",
            "units": "x",
            "modifier": 1
        }
    })

    data_list = []
    
    #get data for each country for each indicator
    for country in country_list:
        country_data = {}
        country_data['Name'] = country['name']
        country_data['ID'] = country['id']

        #be nice
        time.sleep(2)
        indicator_data = requests.get('http://api.worldbank.org/countries/'+country['id']+'/indicators/'+indicator['id']+'/?format=json&per_page=1000')

        dataset = indicator_data.json()[1]

        if dataset:
            for datapoint in dataset:
                country_data[datapoint['date']] = datapoint['value']

            data_list.append(country_data)

    with open('wb_export1/data/'+indicator['id']+'.json', 'w') as fp:
        json.dump(data_list, fp)  

    with open('wb_export1/datasets.json', 'w') as fp:
        json.dump(indicator_list, fp)