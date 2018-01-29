'''
Make GET request for data
'''

# Creates data used for the DataMaps Choropleth

# import library
import helpers as hlp
import json
from collections import Counter as count
import os

def generate_choro_list():

	# move back one directory and go to data folder
	os.chdir("../data")

	country_data = []

	# URL link to JSON data of all circuit locations (73 unique circuits)
	URL = 'http://ergast.com/api/f1/circuits.json?limit=73'
	circuits = hlp.get_data(URL)['MRData']['CircuitTable']['Circuits']

	# Loop over circuits
	for circuit in circuits:

		# gets location data
		location_data = circuit['Location']

		# make list of amount of tracks per country
		country = hlp.check_country(location_data['country'])
		country_data.append(country)

	# 73 unique tracks to add to map
	country_data = hlp.format_choro(country_data)

	with open('choropleth_data.json', 'w') as outfile:
		json.dump(country_data, outfile)

if __name__ == "__main__":
	generate_choro_list()
