'''
Make GET request for data
'''

# import library
import requests
import sys
import json


def get_data(URL):
	'''
	Gets the data from the Ergast API using a valid URL query.
	'''
	try:
		# do GET request
		d = requests.get(url = URL)
		data = d.json()
		return data

	# prints error and exits
	except requests.exceptions.RequestException as e:
		print(e)
		sys.exit(1)

def main():

	circuit_data = {}

	# URL link to JSON data of all circuit locations (73 unique circuits)
	URL = 'http://ergast.com/api/f1/circuits.json?limit=73'
	circuits = get_data(URL)['MRData']['CircuitTable']['Circuits']

	# Loop over circuits
	for circuit in circuits:

		# gets unique circuit id
		circuitId = circuit['circuitId']
		circuit_name = circuit['circuitName']

		# gets location data
		location_data = circuit['Location']

		# appends location data and name to id
		circuit_data[circuitId] = {'Location': location_data}
		circuit_data[circuitId]['circuit_name'] = circuit_name

		# queries for data of every race winner on this circuit
		URL = 'http://ergast.com/api/f1/circuits/' + circuitId + '/results/1.json?limit=67'
		races = get_data(URL)['MRData']['RaceTable']['Races']

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

	with open('circuits.json', 'w') as outfile:
		json.dump(circuit_data, outfile)

if __name__ == "__main__":
	main()