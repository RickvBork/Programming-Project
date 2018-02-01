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

 # Challenges & changes
 (defend changes and decisions)
 
 ##  Trade-offs
