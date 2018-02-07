# Author: Rick van Bork
# Std. nr.: 11990503
#
# Course: Programming Project
#
# Python file to fetch and format data from the Ergast API for building an F1
# themed website. Results in creation
# of five datasets:
# 1. A choro dataset
#			* With amount of races per country per season
#			* Used to color the countries in a map
# 2. A marker dataset
#			* With circuit locations and names
# 3. A laptime dataset
#			* With laptime data per season for each circuit
# 4. A winners dataset
#			* With amount of team wins per F1 team per season
# 5. A rules dataset
#			* With rule changes per season

# imports libraries
import helpers as hlp
import json
import os

def request():

	# moves back one directory and go to data folder
	os.chdir("../data")

	# sets containers for data handling
	winners_data = {}
	winners_list = []
	choro_data = {}
	laptime_data = {}
	marker_data = []
	circuits = {}

	# sets iso lookup dict and all countries with one or more races
	lookup_iso, isos = hlp.get_iso()

	# sets years pre_choro data will be collected for
	first_season = 1950
	last_season = 2017

	# fills pre choro_data set with empty values for every season
	choro_data = hlp.pre_choro_data(isos, first_season, last_season)

	# fills rules_data with rule changes on key seasons
	rules_data = hlp.get_rules(first_season, last_season)

	# sets the max amount of races (check Ergast for current ints)
	max_races = '979'

	# URL link to JSON data of all circuit locations (73 unique circuits)
	URL = 'http://ergast.com/api/f1/results/1.json?limit=' + max_races
	races = hlp.get_data(URL)['RaceTable']['Races']

	# loops over races (with at least one race, port_imperial not included)
	for race in races:

		circuit = race['Circuit']
		circuitId = circuit['circuitId']

		# gets dataMaps iso value of an Ergast API country
		iso = lookup_iso[circuit['Location']['country']]

		# builds choro data
		choro_data[race['season']][iso] += 1

		# checks for unique circuits
		if hlp.check(circuits, circuitId):

			# makes list of data needed for map markers
			hlp.get_marker_dict(marker_data, circuit, lookup_iso)

			# starts new laptime list
			laptime_data[circuitId] = []

		hlp.get_race_dict(laptime_data, race, circuitId)
		hlp.add_winner(winners_data, winners_list, race)

	# formats data into a d3 acceptable format
	hlp.format_choro(choro_data, first_season, last_season)
	hlp.format_winners(winners_data, winners_list, first_season, last_season)

	# lists to loop over with jsonifyer
	datasets = [choro_data, marker_data, laptime_data, winners_data, rules_data]
	datanames = ['choro', 'markers', 'laptimes', 'winners', 'rules']

	# writes files
	i = 0
	for dataset in datasets:

		with open(datanames[i] + '.json', 'w') as outfile:
			json.dump(datasets[i], outfile)
		i += 1

if __name__ == "__main__":
	request()
