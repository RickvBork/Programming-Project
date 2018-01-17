# Week 2

## day 1

I have added the line graph. I chose to include points into the graph denoting the year (season) in which the race took place.
The season circles serve a goal, to show the user gaps in continuation of a race, as sometimes a race is excluded from the calander,
only to be added later.

I have also added a focusline, however, this may be deleted later as it serves little purpose.

The goal is to add a click effect on the circles, and maybe a tooltip on circles where the F1 regulations have changed.

The update function uses a d3 library, d3-interpolate-path. I have chosen for this library for a single reason, the update method for
line graphs built into d3 does not take into account a change in datapoints. See: https://peterbeshai.com/d3-interpolate-path/ for the
difference between default interpolation and interpolation with the library included.

The update function uses a dict with variables that are accessed via indexing. The goal is to add all update variables for all graphs 
into this dict. Otherwhise variables have to be created locally, but passed along multiple functions, creating a dataflow that is difficult
to follow.

## day 2

Done today:
* Update function for the circles along the line graph
* Function that returns a color gradient function.
  * The function is built for easy alteration of the step size and changing of the color gradient.
  * Currently there are steps of 25 creating a four range color gradient.
* Update choropleth function to update the map.
* Crude slider to alter the map colors.

TODO:
* Show circles AFTER clicking a country
* Show the map instantialized from 1950 (currently blank)

### Goal map
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/goalMap0.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/goalMap1.jpg" width="430">

### Current Map
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentMap0.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentMap1.jpg" width="430">

## day 3

Done today:
* Map now initializes with 1950 data
* Map now updates color AND data values
* User/Coder can now easily change the step value and the end color using two variables
* Minor cleanup of drawMap, reduced redundancy by adding functions
* Changed the logic for drawing the line graph
  * Now an empty graph is made to show the user that a graph can be made
  
### Current Map with graph
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentMap2.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentMap3.jpg" width="430">  

* Update focus made functional
* Data for pie chart generated
* On click added to focus element to update TODO piechart
  * On click on focus as it is easier than clicking on small dots is difficult

TODO
* Add text to empty map
  * i.e. click on dot to create map
* Show circles AFTER clicking a country
* Draw pie chart with real data
* Update pie chart with real data (from focus on click)
