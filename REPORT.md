 # 1. Description of the F1 application
 
 # 2. Technical design
 
 ## &nbsp;&nbsp; 2.1 High level overview
 
 ## &nbsp;&nbsp; 2.2 Low level overview
 
 ### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2.2.1 Files
 
 ### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2.2.2 Data
 
 ### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2.2.3 Functions
 
```javascript
function gradientBuilder() {};
```
This functions builds a semi linear color scale. The colors are coupled to an int, the smallest value is given a non linear color. Any color after that is scaled according to a linear scale. This scale is used in **mapDataBuilder();** to build an object wich is recognised by datamaps and can be used in the dataMaps method **updateChoropleth();** to update the map colors. These colors now correspond to int values on the map. This method is coupled to a user controlled slider.

One drawback is that it takes more work to implement this kind of scale than a simple d3 linear scale. However, one advantage is that there is no need for an extra check in the **mapDataBuilder();** function to check for the smallest non linear value, and the color coupled to it. This check would need to be done on every update of the slider, while **gradientBuilder();** is only initialised once and passes the function to a different variable that can be called at will.

The color scale also bundels all value: color 'keys' in one function. This is more logical than a linear scale plus an extra check somewhere else in the code.

Moreover, this color scale can easily be altered for any kind of int data, making the map more flexible for later updates and datasets. The predefined argument is already included for easy updates of scales.

```javascript
function drawMarkers() {};
```
This function draws the markers on the map. A strange 'feature' of dataMaps is that the radius parameter must be passed to the map.bubbles() dataMaps method, but the radius of the markers must also be initialised with a d3 selection. This is some extra work, but the d3 marker selection is needed later anyways for zooming and translating the bubbles across the map.

The function also adds an on click to the markers, used to draw and update the line graph.

The function returns the marker selection and also the radius for later use to reduce redundent d3 selections. The selection is used by **zoom();** and **center();** to correctly reposition the markers after the user pans, zooms or centers the map on a country.

```javascript
function showHideMarkers() {};
```
Groups logic for showing and hiding markers. The display styles are used to make markers non clickable, as making the r attribute equal to 0 still enabled an on click and the mouseover tooltip. Transitions and delays are grouped for ease of use and updating the function. The delay ensures proper animation on hide.

```javascript
function getTrueData() {};
```

When the user wants to select a season from the line chart, this is the function that handles it. First it uses the invert method of the xScale function. This means translating a mouse coordinate to a date string, essentially the reverse process of getting drawing x-axis ticks. Then it bisects this date string into the dataset, returning the index where the date should be stored if inserted into a date sorted data set. Using the index, the trailing and leading datasets are used to find the one closest to the mouse location.

```javascript
function updateTitle() {};
```

Updates title html elements after the user selects a circuit from the map, or a season from the line graph. The class is passed as a string, as is the text the title is to be updated with. The class is used to select the correct element(s) and the text is used to update the element's html.

```javascript
function buildLineChart() {};
```

Groups and handles all logic for building and updating the line chart. The update function is defined in this function to reduce the amount of variables that need to be passed.

# Challenges & changes
 
## Table update and data structure
A challenge was finding a logical way to update a table to the most recent ruleset. The most difficult part was finding a simple way to do 1 of two things:
1. Find a simple way to fill a data object with mostly the same data for all seasons
2. Find a way to revert back to the most recent change of a rule subset (like the engine size or fuel limit)

As the information is not readily available and has to be filled in by hand in excel, the choice was to go for the second option. This saves time updating the information and decreases the amount of duplicate info in the rules dataset. The trade-off is that more work has to be done at the back end to find the most recent ruleset. 

This is implemented by mostly filling the dataset with empty strings, and bisecting a list of all seasons where the rules have changed. If the user selected a season where the rules have not changed, the bisected index is used to find the most recent season where the rules have changed. The rules are keys and the text are the values, key by key a check is made is the text value is not empty. If it is, the index is decreased to an even earlier season where the rules have changed unil the most recent rulechange for the key is found.

## Pie chart update
Another challenge was the pie chart update. It turns out the slices are not, locked, to each label. If an update is made, the order of the labels in the dataset and the order of the slices determine which slice gets which data value. This means if the first slice represents Ferrari, and Mercedes is in the 0th index of the new dataset, the Ferrari slice updates with the mercedes win amount. The ideal update would of be to exit the Ferrari slice and enter the mercedes slice. 

However, due to time constraints and other important focus points, a simple fix was chosen. The dataset now includes all possible winners in alphabetical order (total of 44) at all times. Win values are 0 if slices need to be 'exited'. This creates consistency in the pie chart update, but is not ideal as there should be no need to keep empty datasets around.
