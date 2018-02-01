 # 1. Description of the F1 application
 
 # 2. Technical design
 
 ## &nbsp;&nbsp; 2.1 High level overview
 
 ## &nbsp;&nbsp; 2.2 Low level overview
 
 ### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2.2.1 Files
 
 ### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2.2.2 Data
 
 ### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2.2.3 Functions
 
**gradientBuilder();**
This functions builds a semi linear color scale. The colors are coupled to an int, the smallest value is given a non linear color. Any color after that is scaled according to a linear scale. This scale is used in **mapDataBuilder();** to build an object wich is recognised by datamaps and can be used in the dataMaps method **updateChoropleth();** to update the map colors. These colors now correspond to int values on the map. This method is coupled to a user controlled slider.

One drawback is that it takes more work to implement this kind of scale than a simple d3 linear scale. However, one advantage is that there is no need for an extra check in the **mapDataBuilder();** function to check for the smallest non linear value, and the color coupled to it. This check would need to be done on every update of the slider, while **gradientBuilder();** is only initialised once and passes the function to a different variable that can be called at will.

The color scale also bundels all value: color 'keys' in one function. This is more logical than a linear scale plus an extra check somewhere else in the code.

Moreover, this color scale can easily be altered for any kind of int data, making the map more flexible for later updates and datasets.
 
 # Challenges & changes
 (defend changes and decisions)
 
 ##  Trade-offs
