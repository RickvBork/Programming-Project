# Problem statement

The FIA, the governing body of many automitive sports, have prediodically tried to decrease the speed of the cars from 1994 onwards. However, 
Formula 1 (F1) teams continue to find clever solutions to keep laptimes low to maintain a competitive edge. F1 is currently enjoying an 
injection of new fans after a successfull Social Media strategy. These new fans might benefit from visualizations of what perhaps is the most 
technical and most difficult to follow sport on earth. Currently good visualizations are lacking on the F1 site, this creates a gap to be filled.

## Solution

A visualization showing effects of the biggest rule changes, formula changes, in F1 history.

Key are the lap times and constructor domination, as it is rumored that rule changes break large streaks of domination by a single team.

**Main Features**
1. A slider for selecting a year updating the map showing all the circuits for that year
2. A checkbox for showing all circuits on the map
3. A map showing the location of the selected track
* CLicking on the map selects a circuit
4. A line graph showing the fastest laps per year of the selected circuit
* Hovering the mouse over the line graph selects different years
5. A barchart showing the spread of the fastest laptimes per driver for the selected year
6. A piechart showing win percentages for constructors that have won a race in the selected year
* A constructor is the team building, preparing and running car(s) to participate in F1. E.g. Ferrari, Red Bull etc.
7. A piechart showing win percentages for drivers that have won a race in the selected year year

**Minimal Viable Product (MVP)**
1. Data from 1996-2017
2. map
3. Fastest laps chart per track
4. Percentage pie chart of constructors winning a race
5. The slider and checkbox
6. All interactions between the MVP visualizations

**Extra's**\
 All the other features plus data from 1950-2017 (requires scraping several sites for single fastest laps).
 Workaround is averaging laptimes, over a GP.
 
 ## Prerequisites

**Data Sources and External Components**
1. Ergast API
* For single fastest lap data from 1996 onwards
* Workaround for all data (1950-2017) is using average laptimes
* http://ergast.com/api/f1/results/1 query for constructor, average lap times, circuit and year
* http://ergast.com/api/f1/circuits/albert_park/results/1 query for all previous data per circuit ID
2. D3
* For the visualizations
3. pattern
* For optional scraping (sites to be added)

**Hardest Parts**
* Scraping for additional data.
* Using new API

