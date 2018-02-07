# Author: Rick van Bork
# Std. nr.: 11990503
#
# Course: Programming Project
#
# Helpers file to fetch and format data from the Ergast API. Called from 
# request.py


# import libraries
import requests
import sys
import csv
import os
from collections import Counter as count
from operator import itemgetter

def get_data(URL):
	'''
	Gets the data from the Ergast API using a valid URL query.
	'''
	try:
		# do GET request
		d = requests.get(url = URL)
		data = d.json()['MRData']
		return data

	# prints error and exits
	except requests.exceptions.RequestException as e:
		print(e)
		sys.exit(1)

def pre_choro_data(isos, first_season, last_season):
	'''
	Fills a dict with all F1 seasons. Then fills each season key with a dict of all isos (countries which, at some point, will host a GP) keying a placeholder race number (0).
	'''

	choro_data = {}
	for season in range(first_season, last_season + 1):

		season = str(season)
		choro_data[season] = {}
		for iso in isos:
			choro_data[season][iso] = 0

	return choro_data

def format_choro(choro_data, first_season, last_season):
	'''
	Formats the choro data by summing the leading season to the previous season and adding the result to the correct season index of the choro_data dict.
	'''

	for season in range(first_season, last_season):

		# gets previous and current season
		x = choro_data[str(season)]
		y = choro_data[str(season + 1)]

		# sum dicts of previous and next season
		choro_data[str(season + 1)] = {k: x.get(k, 0) + y.get(k, 0) for k in set(x)}

def get_marker_dict(marker_data, circuit, lookup_iso):
	'''
	Generates a list item (dict) for the circuit markers on the map. Returns the list item for list appending.
	'''

	# sets the empty list item
	list_item = {}

	location_data = circuit['Location']

	# fills list item with key: value pairs
	list_item['circuitId'] = circuit['circuitId']
	list_item['circuit_name'] = circuit['circuitName']
	list_item['latitude'] = location_data['lat']
	list_item['longitude'] = location_data['long']
	list_item['fillKey'] = 'bubble'
	list_item['country'] = lookup_iso[location_data['country']]

	marker_data.append(list_item)

def get_race_dict(laptime_data, race, circuitId):
	'''
	Generates a list item (dict) for the F1 line chart. Returns the list item for list appending.
	'''

	# sets the empty list item
	list_item = {}

	# fills list item with key: value pairs
	list_item['season'] = race['season']
	list_item['round'] = race['round']
	laps = int(race['Results'][0]['laps'])
	list_item['time'] = int(race['Results'][0]['Time']['millis']) / laps

	laptime_data[circuitId].append(list_item)

def add_winner(winners_data, winners_list, race):
	'''
	Adds a winner to a list. Format so results can be scaled to more than just constructor data.
	'''

	season = race['season']
	winner = race['Results'][0]['Constructor']['name']

	if winner not in winners_list:
		winners_list.append(winner)

	try:
		winners_data[season]['constructor'].append(winner)
	except KeyError:
		winners_data[season] = {}
		winners_data[season]['constructor'] = []
		winners_data[season]['constructor'].append(winner)

def format_winners(winners_data, winners_list, first_season, last_season):
	'''
	Uses a winner list to generate a pie chart acceptable data set.
	'''

	for season in range(first_season, last_season + 1):

		temp = []
		season = str(season)

		# make unique winners key amount of wins
		seasonal_wins = dict(count(winners_data[season]['constructor']))

		# append seasonal winners
		seasonal_winners = []
		for winner, wins in seasonal_wins.items():
			seasonal_winners.append(winner)
			temp.append({'label': winner, 'value': wins})

		# append non seasonal winners with value = 0
		for winner in winners_list:
			if winner not in seasonal_winners:
				temp.append({'label': winner, 'value': 0})

		# sort the temp list alphabetically
		sorted_list = sorted(temp, key=lambda k: k['label'])
		winners_data[season]['constructor'] = sorted_list

def check(circuits, circuitId):
	'''
	Checks if a track is unique.
	'''

	try:
		if circuits[circuitId]:
			return False
	except KeyError:
		circuits[circuitId] = True
		return True

def get_iso():
	'''
	Generates a lookup dict for translating Ergast API country names to dataMaps iso names.
	'''

	# moves back one directory into data folder and sets the csv file name
	os.chdir("../data")
	file_name = 'country_iso.csv'
	country_iso_dict = {}

	# opens the csv file and generates iterable rows
	with open(file_name) as csvfile:
		rows = csv.reader(csvfile)

		isos = []
		for row in rows:

			# skips commented lines
			if not row[0].startswith('#'):
				iso = row[1]
				country_iso_dict[row[0]] = iso

				if iso not in isos:
					isos.append(iso)

		return country_iso_dict, isos

def get_rules(first_season, last_season):

	# moves back one directory into data folder and sets the csv file name
	os.chdir("../data")
	file_name = 'rules.csv'
	rules = {}

	# opens the csv file and generates iterable rows
	with open(file_name) as csvfile:
		rows = csv.reader(csvfile)

		# remove season from headers
		row1 = next(rows)
		rules = {}
		for row in rows:

			seasonal_rules = {}
			for i in range(len(row1) - 1):

				# build the rule dict without season header
				seasonal_rules[row1[i + 1]] = row[i + 1]

			# couples rules to the right season
			rules[row[0]] = seasonal_rules

		return rules