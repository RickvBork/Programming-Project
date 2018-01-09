# Design

This file describes the overall design and technical parts of the project.

## API's and Plugins

## Data Sources

For this project, multiple data sources can be used, depending if the MVP is chosen or a more complete project is finalized.

1. ***Possible MVP data sources:***
* *Ergast API*
  * API containing race data of multiple series. Data can be queried for with GET requests and unique URLs.
  * Currently request.py can query for data manually, ultimately should be linked to project.js for automisation.
  * For 1950-2017, average laptimes must be used as fastest laps are from 1996 onwards and Q3 laps are only fully supported from 2003 onwards.
* *F1 main site*
  * URL = https://www.formula1.com/en/results.html/xxxx/races/race-result.html (xxxx is a four digit year 1950-2017)
  * Can be scraped for single fastest laps for a GP in a country. Not circuit specific, thus limited usability.
* *F1 Database site(s)*
  * URL = http://www.f1db.de/database/season/xxxx/yy/index.html (yy is a two digit number specifying the round for a given year)
  * Can be scraped per year per round for all relevant data (Winning Constructor, Driver, Fastest Lap, Pole 'Q3' Time etc.) ***Except Location***
  * Difficulty might be linking to Ergast API due to differing names for circuits etc. However the following request: http://ergast.com/api/f1/xxxx/yy.json includes lat, long and circuit ID for building a dict coupling the two naming systems if required.

## Data structure

For the data structure the following must be considered:

1. A JSON with all unique tracks for building the map. Contains:
  * ID identical for all track queries
  * Country?
  * Length?
  * lat and lon for drawing on map (Ergast)

2. A JSON with all fastest/average laptimes per track. Contains:
  * Track ID
  * List with dictionaries {'year': xxxx, 'laptime': float}
  
See JSON_example for possible layout.

## Component description and data management

1. Use Python to:
  1. Find all circuit IDs http://ergast.com/api/f1/circuits.json
  * Iterate over
  * Use this to start building a dict with the structure found in JSON.example
  2. Use IDs to query for results (winners) http://ergast.com/api/f1/circuits/"ID"/results/1
  * Calculate average laptimes
  * OR scrape for qualifying laptime, withing Races key is year and round data for xxxx and yy http://www.f1db.de/database/season/xxxx/yy/index.html
  3. Fill with other relevant information
  
Use dict as JSON input for JS.

Components for JavaScript MVP:
1. Build worldmap function
2. Line Graph functions
  * Build first graph function, calls 1 time after user selects a country
    * Draw title
    * Draw axes
    * Draw line
    * Some crosshair function?
  * Update Graph functions, calls after a user switches country
    * Update title
    * Update axes
    * Update line
    * update mouseover crosshairs (hide/show with CSS)
3. Pie Chart functions (constructors AND race winners)
  * Build first chart function, calls 1 time after user selects a country. Uses most recent year in the data.
    * Draw title
    * Draw legend
    * Draw Chart
  * Update Chart functions, calls after a user scrolls over years
    * Update title
    * Draw legend
    * Update Chart
    
## APIs & Libraries

1. Ergast API
  * For getting racedata
2. D3
  * For Visualizations
3. Tooltip
  * For displaying tooltips
4. pattern
  * For possible Web Scraping module
5. DataMaps
  * For building a worldmap

