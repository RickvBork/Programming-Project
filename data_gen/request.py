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

	circuit_data = {}
	circuits_list = []

	# URL link to JSON data of all circuit locations (73 unique circuits)
	URL = 'http://ergast.com/api/f1/circuits.json?limit=73'
	circuits = hlp.get_data(URL)['MRData']['CircuitTable']['Circuits']

	# Loop over circuits
	for circuit in circuits:

		# gets unique circuit id
		circuitId = circuit['circuitId']
		circuit_name = circuit['circuitName']

		# gets location data
		location_data = circuit['Location']

		# get the 3 letter ISO code
		country = hlp.check_country(location_data['country'])
		iso = hlp.country_iso(country);

		# make list of data needed for map
		circuits_list.append({'circuitId': circuitId, 'circuit_name': circuit_name, 'latitude': location_data['lat'], 'longitude': location_data['long'], 'fillKey': 'bubble', 'country': iso})

		# appends location data and name to id
		circuit_data[circuitId] = {'circuit_name': circuit_name}

		# queries for data of every race winner on this circuit
		URL = 'http://ergast.com/api/f1/circuits/' + circuitId + '/results/1.json?limit=67'
		races = hlp.get_data(URL)['MRData']['RaceTable']['Races']

		circuit_data[circuitId]['data'] = []
		# loop over race data
		for race in races:
			season = race['season']

			# for later scraping of fastest laps
			s_round = race['round']
			laps = int(race['Results'][0]['laps'])

			try:
				time = int(race['Results'][0]['Time']['millis']) / laps
			except KeyError:
				# suzuka 2015 total race time
				time = 5286508 / laps

			circuit_data[circuitId]['data'].append({'season': season, 'round': s_round, 'time': time})

	# circuit_races.json

	# circuitId keying races held on it
	with open('test0.json', 'w') as outfile:
		json.dump(circuit_data, outfile)

	# circuit_map.json

	# list of dicts of circuitIds keying location data
	with open('test1.json', 'w') as outfile:
		json.dump(circuits_list, outfile)

if __name__ == "__main__":
	main()
