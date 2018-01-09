# Design

This file describes the overall design and technical parts of the project.

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
