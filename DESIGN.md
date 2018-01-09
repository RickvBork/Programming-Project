# Design

This file describes the overall design and technical parts of the project.

## Data Sources

For this project, multiple data sources can be used, depending if the MVP is chosen or a more complete project is finalized.

1. ***Possible MVP data sources:***
* *Ergast API*
..* An API containing race data of multiple series. Data can be queried for with GET requests and unique URLs.
..* Currently request.py can query for data manually, ultimately should be linked to project.js for automisation.
..* For 1950-2017, average laptimes must be used as fastest laps are from 1996 onwards and Q3 laps are only fully supported from 2003 onwards.
* *F1 main site*
..* URL = https://www.formula1.com/en/results.html/xxxx/races/race-result.html (xxxx is a four digit year 1950-2017)
..* Can be scraped for single fastest laps for a GP in a country. Not circuit specific, thus limited usability.

