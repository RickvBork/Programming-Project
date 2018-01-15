import requests
import sys

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

def check_country(country):
	'''
	Changes origin of countries not included in DataMaps
	'''

	if country == 'Bahrain':
		country = 'UAE'
	elif country == 'Singapore':
		country = 'Malaysia'
	elif country == 'Korea':
		country = 'South Korea'
	elif country == 'Monaco':
		country = 'France'

	return country

def format_choro(data_list):
	'''
	Takes a list and formats the country names to DataMaps standard
	'''

	country_names = {'Sweden': 'SWE', 'China': 'CHN', 'United Arab Emirates': 'URE', 'Hungary': 'HUN', 'Austria': 'AUT','Italy': 'ITA','Spain': 'ESP','Portugal': 'PRT', 'Russia': 'RUS', 'Switzerland': 'CHE', 'Germany': 'DEU', 'Australia': 'AUS', 'Malaysia': 'MYS', 'Canada': 'CAN', 'India': 'IND', 'South Korea': 'KOR', 'Belgium': 'BEL', 'Netherlands': 'NLD', 'France': 'FRA', 'Japan': 'JPN', 'UK': 'GBR', 'South Africa': 'ZAF', 'Morocco': 'MAR', 'Azerbaijan': 'AZE', 'Brazil': 'BRA', 'Argentina': 'ARG', 'France': 'FRA', 'Mexico': 'MEX', 'Turkey': 'TUR', 'USA': 'USA', 'UAE': 'UAE'}

	# generates a list of list with country codes coupled to amount of tracks in country
	data_list = [[country_names[country], data_list.count(country)] for country in set(data_list)]

	return data_list

def country_iso(data):

	country_names = {'Sweden': 'SWE', 'China': 'CHN', 'United Arab Emirates': 'URE', 'Hungary': 'HUN', 'Austria': 'AUT','Italy': 'ITA','Spain': 'ESP','Portugal': 'PRT', 'Russia': 'RUS', 'Switzerland': 'CHE', 'Germany': 'DEU', 'Australia': 'AUS', 'Malaysia': 'MYS', 'Canada': 'CAN', 'India': 'IND', 'South Korea': 'KOR', 'Belgium': 'BEL', 'Netherlands': 'NLD', 'France': 'FRA', 'Japan': 'JPN', 'UK': 'GBR', 'South Africa': 'ZAF', 'Morocco': 'MAR', 'Azerbaijan': 'AZE', 'Brazil': 'BRA', 'Argentina': 'ARG', 'France': 'FRA', 'Mexico': 'MEX', 'Turkey': 'TUR', 'USA': 'USA', 'UAE': 'UAE'}

	return country_names[data]
