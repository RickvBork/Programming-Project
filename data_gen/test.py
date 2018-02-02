# import library
import helpers as hlp
import requests
import sys
import json
from collections import Counter as count
import os

def main():

	# move back one directory and go to data folder
	os.chdir("../data")

	# sets containers for data handling
	winners_data = {}
	choro_data = {}
	laptime_data = {}
	marker_data = []
	circuits = {}

	# sets iso lookup dict and all countries with one or more races
	lookup_iso, isos = hlp.get_iso()

	# sets years pre_choro data will be collected for
	first_season = 1950
	last_season = 2017

	# fill pre choro_data set with empty values for every season
	choro_data = hlp.pre_choro_data(isos, first_season, last_season)

	# sets the max amount of races (check Ergast for current ints)
	max_races = '979'

	# URL link to JSON data of all circuit locations (73 unique circuits)
	URL = 'http://ergast.com/api/f1/results/1.json?limit=' + max_races
	races = hlp.get_data(URL)['RaceTable']['Races']

	# loop over races (with at least one race, port_imperial not included)
	for race in races:

		circuit = race['Circuit']
		circuitId = circuit['circuitId']

		# gets dataMaps iso value of an Ergast API country
		iso = lookup_iso[circuit['Location']['country']]

		# build choro data
		choro_data[race['season']][iso] += 1

		# checks for unique circuits
		if hlp.check(circuits, circuitId):

			# make list of data needed for map markers
			hlp.get_marker_dict(marker_data, circuit, lookup_iso)

			# starts new laptime list
			laptime_data[circuitId] = []

		hlp.get_race_dict(laptime_data, race, circuitId)

		hlp.add_winner(winners_data, race)

	# formats the choro data into dataMaps acceptable format
	hlp.format_choro(choro_data, first_season, last_season)

	# formats the winners data into d3 pie chart acceptable format
	hlp.format_winners(winners_data, first_season, last_season)

	# TESTED!
	with open('choro.json', 'w') as outfile:
		json.dump(choro_data, outfile)

	# TESTED!
	with open('markers.json', 'w') as outfile:
		json.dump(marker_data, outfile)

	# TESTED!
	with open('laptimes.json', 'w') as outfile:
		json.dump(laptime_data, outfile)

	# TESTED!
	with open('winners.json', 'w') as outfile:
		json.dump(winners_data, outfile)

if __name__ == "__main__":
	main()
