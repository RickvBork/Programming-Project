# imports libraries
import helpers as hlp
import json
from collections import Counter as count
import os

def gen_choro_races():

	# move back one directory
	os.chdir("../data")

	country_data = {}
	total_races = {}

	# loop over seasons
	for season in range(1950, 2018):

		country_data[season] = {}

		# get json data for this season and round
		URL = 'http://ergast.com/api/f1/' + str(season) + '/circuits.json'
		circuits = hlp.get_data(URL)['CircuitTable']['Circuits']
		lookup_iso = hlp.get_iso()

		# loop over circuits
		for circuit in circuits:

			# translates to DataMaps iso
			iso = lookup_iso[circuit['Location']['country']]

			try:
				# get amount of races raced in the country
				total_races[iso] += 1

			except KeyError:
				# start new race counter for a country
				total_races[iso] = 1

		country_data[int(season)] = dict(total_races)

	seasons = country_data.keys()
	isos = total_races.keys()

	# loops over seasons
	for season in seasons:
		for iso in isos:

			# if a country is not in data fill races with value 0
			if not iso in country_data[season]:
				country_data[season][iso] = 0

	print(country_data)

	with open('choro_races.json', 'w') as outfile:
		json.dump(country_data, outfile)

if __name__ == "__main__":
	gen_choro_races()