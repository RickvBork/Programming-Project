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

## Day 4

Done today:
* General pie chart generator coupled to current dataset
  * Generator has smooth intro animation
  * Generator has a smooth update animation
  * Update takes into account changes in data size
 
TODO
* fix bug in pie chart generator that causes whitespace to appear when using the default pie.sort() function
  * Bug fixable by  generating data in descending order and using d3.pie().sort(null)
* fix bug in pie chart update that deletes colors of slices that are deleted after an update
  * probably caused by inconsistant use of d3.scale.category20();
* Add text to empty map
  * i.e. click on dot to create map
* Show circles AFTER clicking a country

## Day 5

Done today:
* Cleaned up libs packages
* Cleaned up data flow in script
* Tried to get rid of global update variable (no success)

# Week 3

## Day 6

Done today:
* Made a color gradient legend (step size == 1)
* Made a placeholder tooltip coupled to the legend

TODO
* Couple legend to countries?
* Style tooltip
* Make function that correctly returns amount of races from mouseover

<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/legendMap0.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/legendMap1.jpg" width="430">

## Day 7

Done today:
* Fixed race amount to be returned
* Found a method to select countries (paths) based on the returned amount of the legend.
  * Can be used to give user feedback what countries have a certain amount of races.


## Day 8

Done today:
* Coupled legendBar mouseover to the map to give user feedback on the countries with a given race value.
  * The border width of a country semi-permanently changes size if the user selects via the legend mouseover.
  * The border width decreases on subsequent mouseovers and selects new countries to change the border width.

## Day 9

Done Today:
* Added a delay/transition to the map legend selector.
  * It is now easier for the user to select a country based on the number of races held there.
* Improved map zoom function (multiple drag actions and after zoom to country still buggy).
  * Drag value changes and shifts map
  * After zoom to country and multiple drags, the next country zoom and drag causes an abrupt shift caused by the drag value not being [0, 0] anymore.
  
## Day 10

Done today:
* Overhauled the map translation and scaling, translation is now based on projection rather than <g> transformation.
  * Circles now correctly resize on scale change.
  * Circles now correctly change location based on updated projection.
  * Drag, scroll zoom and click to center all work correctly in series.
  * Only bug is circles lag after country click due to differences in transition timings of paths and circles.
* Added country iso to circle data.
   * Add ISO to class name (or by looping over data) for easy selection after path on click.
   * TODO show by altering opacity.
 
 # Week 4
 
 ## Day 11
 
 Done today:
 * Added user feature for showing and removing circuit markers
 * Code cleanup in map init
 
### User enabled to remove clutter from map
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentMap4.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentMap5.jpg" width="430">
 
### Circuit markers can now can be enabled after on click and radius is dependent on size
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentMap6.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentMap7.jpg" width="430">
 
 TODO:
 * Code cleanup
   * Mainly make update of piechart and line graph part of main init functions
 * Cleanup of line graph axes for better readability
 * Titles for piechart and linegraph
 * Tooltip for piechart
 * Webpage layout
 * Fix bugs
   * Color bug in Map (max value of 123 races is black not dark red)
   * Color bug in piechart (Caused by color function not shared between draw and update functions)
   * Circuit marker bug (markers not 'fixed' to map when translating after clicking a country)
   
 ### Map color bug likely caused by script fault in color gradient builder
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/bug01.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/bug02.jpg" width="430">
 
### Pie color bug likely caused by not sharing color functions between draw and update
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/bug11.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/bug12.jpg" width="430">

## Day 12

Done today:
* Started general layout of site
  * Features a menu bar
  * Clickable links that scroll to a certain part of the site
  * Map in styled container
* Made two scroll to sections of the site
  * About (general project description)
  * Visualizations (two rows with visualizations)
* Fixed a bug with bootstrap overwriting CSS for tooltip

### (Left) Current webpage (Right) Webpage with correct top (blue yellow div colors are for debugging)
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/webpage0.jpg" width="430"><img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/webpage1.jpg" width="430">

## Day 13

Done today:
* Fixed color bug in map caused by gradientBuilder
  * Commented and generalised the gradientBuilder function
* Finished provisional layout of site
* Fully integrated test data into code (test1)
* Code cleanup in map.done

### Current webpage (blue yellow & red div colors are for debugging)
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/webpage2.jpg" width="430">

## Day 14

Done today:
* Factored out functions and cleaned up code in:
  * slideUpdateMap();
  * buildLegend();
  * showHideMarkers();
  * mapDataBuilder();
  * borderChange(); (WIP)
* Coupled legendBar and tooltip
  * Legend now fully scalable for later updates and changes
* Fixed fill issue with bootstrap rows
  * Page section (visualizations) width now 100% of screen width
* Found bug
  * Not all circuits are drawn (e.g. Red Bull Ring) Check races generating data
  * map.options.data does not have correct dataMaps iso values (causes borders to not reset)

TODO:
* Redo choroData
  * Source of wrong iso codes causing the border bug (UAE is one of the wrong codes)
* Factor out other functions
* Make linechart and update one function (for ease of use and scaling)
* Make piechart and update one function (for ease of use and scaling)

## Day 15

Done today:
* Overhauled request.py
  * Border bug removed
* request.py now groups most data generation
* test.py now handles data generation
  * amount of GET requests reduced from 142 to 1
  * Reason for this is because the current request should not be possible according to the maker of the API so I didn't try
  * Doing so drastically improves time to request and format all data
  
TODO:
* Finish pie chart and line graph code
* Layout
* Find and fix bugs

## Day 16

Done today:
* Cleaned up code in line graph generator
  * No update dict needed anymore
  * yAxis ticks now correctly display minutes:seconds of average laptimes
* Cleaned up code in pie chart generator
  * partly fixed color bug in pie chart generator
* Found new bug
  * Colors of slices not consistent with labels
  * Colors are dependent on the order of the 'winners' in the list
    * Fix by building the dict up with changes per season in mind

TODO:
* Finish layout
* Find and fix bugs
* Final code cleanup and checks

## Day 17

Done today:
* Cleaned up pie chart generator
* Partly fixed color bug in pie chart
  * Colors are now consistent with winners
  * Now there are not enough colors for each winner
* Fixed consistency bug in pie chart generator
  * Fixed by adding all winners and setting values to 0
* Started on the rule tables
  * Made dataset
  * Engine rules implemented

### Engine table after selecting the 2017 season on the line graph (blue yellow & red div colors are for debugging)
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentTable0.jpg" width="800">

### And after selecting the 2012 season
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/currentTable1.jpg" width="800">

TODO:
* FInish layout
* Find and fix bugs
  * Try to find a better pie chart solution
* Final code cleanup

## Day 18

Done today:
* Better implemented scroll nav
* Polished and minimized layout
* Code cleanup
* Increased rule table information
* Updated titles of visualizations
* Improved line chart update animation

### Current site before an update
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/beforeUpdate.jpg" width="800">

### And after a full update (select circuit & a season)
<img src="https://github.com/RickvBork/Programming-Project/blob/master/doc/afterUpdate.jpg" width="800">

TODO:
* Add hover info on pie chart
* FInish layout
* Find and fix bugs
  * Try to find a better pie chart solution
* Final code cleanup

## Day 19

Done today:
* Final code cleanup
* Pie chart layout
* Small site layout changes
* TODOs removed
