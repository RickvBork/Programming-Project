'''
Make GET request for data
'''

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

	winners_data = {}
	choro_data = {}
	laptime_data = {}
	marker_data = []

	countries = []

	# sets years data will be collected for
	first_season = 1950
	last_season = 2017

	# sets the max amount of circuits and races (check Ergast for current ints)
	max_circuit_amount = '73'
	max_race_amount = '67'

	# URL link to JSON data of all circuit locations (73 unique circuits)
	URL = 'http://ergast.com/api/f1/circuits.json?limit=' + max_circuit_amount
	circuits = hlp.get_data(URL)['CircuitTable']['Circuits']
	lookup_iso, isos = hlp.get_iso()

	# fill pre choro_data set with empty values for every season
	choro_data = hlp.pre_choro_data(isos, first_season, last_season)

	# Loops over all F1 circuits
	for circuit in circuits:

		circuitId = circuit['circuitId']
		country = circuit['Location']['country']
		iso = lookup_iso[country]

		# make list of data needed for map markers
		hlp.add_marker(marker_data, circuit, lookup_iso)

		# queries for data of every race winner on this circuit
		URL = 'http://ergast.com/api/f1/circuits/' + circuitId + '/results/1.json?limit=' + max_race_amount
		races = hlp.get_data(URL)['RaceTable']['Races']

		# start an empty laptimes list for the circuit
		laptime_data[circuitId] = []

		# loop over race data for the current circuit
		for race in races:

			season = race['season']

			results = race['Results'][0]

			# build choro data
			choro_data[season][iso] += 1

			# appends a dict to the laptimes list for a circuit
			hlp.get_race_dict(laptime_data, race, circuitId)

			# for later scraping of fastest laps
			# s_round = race['round']

	# formats the choro data into dataMaps acceptable format
	hlp.format_choro(choro_data, first_season, last_season)
	# hlp.format_winners(winners_data, first_season, last_season)

	files = ['laptimes', 'markers', 'choro']

	# # circuitId keying races held on it
	# with open('laptimes.json', 'w') as outfile:
	# 	json.dump(laptime_data, outfile)

	# # list of dicts of circuitIds keying location data
	# with open('markers.json', 'w') as outfile:
	# 	json.dump(marker_data, outfile)

	# with open('choro.json', 'w') as outfile:
	# 	json.dump(choro_data, outfile)

if __name__ == "__main__":
	main()
