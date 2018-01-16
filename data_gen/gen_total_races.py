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

		# loop over circuits
		for circuit in circuits:

			# check if country is in DataMaps
			country = hlp.check_country(circuit['Location']['country'])

			# translate to DataMaps iso
			iso = hlp.country_iso(country)

			try:
				# get amount of races raced in the country
				total_races[iso] += 1

			except KeyError:
				# start new race counter for a country
				total_races[iso] = 1

		country_data[int(season)] = dict(total_races)

	seasons = country_data.keys()
	isos = total_races.keys()

	for season in seasons:
		for iso in isos:
			print(season, iso)
			if not iso in country_data[season]:
				print(season, iso)
				country_data[season][iso] = 0

	with open('choro_races.json', 'w') as outfile:
		json.dump(country_data, outfile)

if __name__ == "__main__":
	gen_total_races()