'''
Make GET request for data
'''

# Creates data used for the DataMaps Choropleth

# import library
import helpers as hlp
import json
from collections import Counter as count
import os

def gen_winners():

	# move back one directory
	os.chdir("../data")

	test = []
	winners = {}

	# loop over seasons
	for season in range(1950, 2018):

		season = str(season)

		# get json data for winning constructors and drivers
		URL = 'http://ergast.com/api/f1/' + season + '/results/1.json'
		data = hlp.get_data(URL)['MRData']

		# get circuits raced in the season
		races = data['RaceTable']['Races']

		constructors = []
		constructor_wins = []
		winners[season] = []

		# loop over races and append all constructors to list
		for race in races:

			constructor = race['Results'][0]['Constructor']['name']
			
			# check if constructor has won already
			if constructor not in constructors:
				constructors.append(constructor)

			if constructor not in test:
				test.append(constructor)

			constructor_wins.append(constructor)

		for constructor in constructors:

			win_dict = {}
			win_dict['label'] = constructor
			win_dict['value'] = constructor_wins.count(constructor)
			winners[season].append(win_dict)

	# 44 unique winners as of 2017
	with open('winners.json', 'w') as outfile:
		json.dump(winners, outfile)

if __name__ == "__main__":
	gen_winners()