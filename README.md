# Problem statement

The FIA, the governing body of many automitive sports, have prediodically tried to decrease the speed of the cars from 1994 onwards. However, 
Formula 1 (F1) teams continue to find clever solutions to keep laptimes low to maintain a competitive edge. F1 is currently enjoying an 
injection of new fans after a successfull Social Media strategy. These new fans might benefit from visualizations of what perhaps is the most 
technical and most difficult to follow sport on earth. Currently good visualizations are lacking on the F1 site, this creates a gap to be filled.

## Solution

**Main Features**
1. A slider for selecting a host country of an F1 venue
2. A dropdown for selecting an F1 circtuit included in the calender for the selected country
3. A map showing the location of the selected track
4. A line graph showing the fastest laps per year of the selected track
5. A barchart showing the spread of the fastest laptimes per driver
6. A piechart showing win percentages for constructors that have won a race that year
..* A constructor is the team building, preparing and running car(s) to participate in F1. E.g. Ferrari, Red Bull etc.
7. A piechart showing win percentages for drivers that have won a race that year

**Minimal Viable Product**
1. Data from 1996-2017
2. map
3. Fastest laps chart per track
4. Percentage pie chart of constructors winning a race

**Extra's**
 All the other features plus data from 1950-2017 (requires scraping several sites).
 
 ## Prerequisites
 
1. Ergast API\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* For data from 1996 onwards
2. D3\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* For the visualizations
3. pattern\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* For optional scraping
