'''
Make GET request for data
'''

# Creates data used for the DataMaps Choropleth

# import library
import helpers as hlp
import json
from collections import Counter as count
import os

def gen_total_races():

	# move back one directory
	os.chdir("../data")

	country_data = {}
	total_races = {}

	# loop over seasons
	for season in range(1950, 2018):

		country_data[season] = {}

		# get json data for this season and round
		URL = 'http://ergast.com/api/f1/' + str(season) + '/circuits.json'
		data = hlp.get_data(URL)['MRData']

		# get circuits raced in the season
		circuits = data['CircuitTable']['Circuits']

		# start season dict
		country_data[season] = {}

		# loop over circuits
		for circuit in circuits:

			# check is country is in DataMaps
			country = hlp.check_country(circuit['Location']['country'])

			# translate to DataMaps iso
			iso = hlp.country_iso(country)

			try:
				# get amount of races raced in the country
				total_races[iso] += 1

			except KeyError:
				# start new race counter for a country
				total_races[iso] = 1

		# add all previous race data
		country_data[season] = total_races

	with open('choro_races.json', 'w') as outfile:
		json.dump(country_data, outfile)

if __name__ == "__main__":
	gen_total_races()