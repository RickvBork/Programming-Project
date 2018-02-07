/*
Author: Rick van Bork
Std. nr.: 11990503

Course: Programming Project

The following script is the logic for an F1 oriented website with three interactive elements. The interactive elements are:
1. A map with:
  * Mouse click panning
  * Click panning
  * Scroll zooming
  * Interactive markers which update a line chart
2. A line chart with
	* Interactive overlay elements which update a pie chart
3. A pie chart

The three elements respectively show:
1. F1 circuit locations & per country race amounts throughout the years
2. Laptimes per circuit throughout the years
3. Team wins of a selected season
*/

"use strict";

// loads the DOM and preloads data
window.onload = function() {

	// go up one folder into 'data' folder relative to 'main' folder
	var relDataPath = '../data/';

	// gueues data
	d3.queue()
		.defer(d3.json, relDataPath + 'test2.json') // laptime data
		.defer(d3.json, relDataPath + 'test0.json')  // choro data
		.defer(d3.json, relDataPath + 'test3.json')	// winners data
		.defer(d3.json, relDataPath + 'test1.json')	// markers data
		.defer(d3.json, relDataPath + 'test4.json')  // rules data
		.await(mainFunction);
};

/*
* Main Function for error handling.
*/
function mainFunction(error, laptimes, choro, winners, markers, rules) {

	if (error) {
		alert("An error has ocurred!\nPlease reload page.");
		throw error;
	};
	drawMap(markers, choro, laptimes, winners, rules);
};

/*
* Draws the map and calls further visualization functions upon completion.
*/
function drawMap(data, choro, laptimes, winners, rules) {

	// get the min and max values in choro data
	var seasons = Object.keys(choro),
	domain = [0, Math.max.apply(null, Object.values(choro[seasons[seasons.length - 1]]))];

	// sets the color transition on the map
	var firstColor = '#dcb2b2',
	lastColor = '#8b0000',
	defaultFill = '#f4f4f4',
	step = 1,
	color = gradientBuilder(defaultFill, firstColor, lastColor, step, domain);

	var container = d3.select('#container'),
		margin = {top: 0, right: 100, bottom: 0, left: 0},
		width =+ parseInt(container.style('width'), 10) - margin.left - margin.right,
		height =+ parseInt(container.style("height"), 10) - margin.top - margin.bottom;

	// get the season on which the slider is initialised
	var slider = d3.select('#myRange'),
		INITSEASON = slider.attr('value'),
		isos = Object.keys(choro["1950"]);

	// build a mapData dict to initialise map
	var mapData = mapDataBuilder(INITSEASON, color, choro, isos);

	// draws the world map in Mercator projection
	var map = new Datamap({element: document.getElementById('container'),
		height: height,
		width: width,	
		projection: 'mercator',
		geographyConfig: {
			popupTemplate: function(geography, data) {

				// only shows popup when the country has had a race
				if (data.races != 0) {
					return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong><br>Races: ' + data.races + '</br></div>';
				};
			},
			borderWidth: 0.25,
			borderColor: '#7e7e7e',
			popupOnHover: true,
			highlightOnHover: true,
			highlightFillColor: '#999999',
			highlightBorderColor: '#7e7e7e',
			highlightBorderWidth: 1,
			highlightBorderOpacity: 1
		},
		fills: {

			defaultFill: defaultFill
		},
		data: mapData,
		done: function(map) {

			// draws and returns circle markers
			var markers = drawMarkers(data, map);

			// builds an interim line graph
			buildLineChart(laptimes, winners, rules, markers);

			var zoom = d3.behavior.zoom()
				.translate(map.projection.translate())
				.scale(map.projection.scale())
				.scaleExtent([50, 1000])
				.on("zoom", zoom);

			var path = d3.geo.path()
				.projection(map.projection);

			// select countries and circuits
			var paths = d3.selectAll('.datamaps-subunit');

			// set mouse zoom on svg element
			map.svg.call(zoom);

			/*
			* Adds scroll zoom and mouse drag functionality to the map. 
			* Updates both paths and circles.
			*/
			function zoom() {
				map.projection.translate(d3.event.translate).scale(d3.event.scale);
				paths.attr("d", path);

				markers.circles
					.attr("cx", function(d) { 
						return map.projection([d.longitude ,d.latitude])[0]
					})
					.attr("cy", function(d) { 
						return map.projection([d.longitude, d.latitude])[1]
					});
			};

			/*
			* Given path data, calculates the center of the path and moves map * to the new center location. Updates both paths and circles.
			*/
			function center(d) {

				// console.log(d.id);

				// var test = map.svg.selectAll('.datamaps-bubble.' + d.id);
				// console.log(test);

				var centroid = path.centroid(d),
					translate = map.projection.translate();

				// calculates correct coordinates
				var x = translate[0] - centroid[0] + width / 2,
					y = translate[1] - centroid[1] + height / 2;

				map.projection.translate([x, y]);

				zoom.translate(map.projection.translate());

				paths.transition()
					.duration(1000)
					.attr("d", path);

				markers.circles.transition()
					.duration(890)
					.attr("cx", function(d) { 
						return map.projection([d.longitude ,d.latitude])[0]
					})
					.attr("cy", function(d) { 
						return map.projection([d.longitude, d.latitude])[1]
					});
			};

			// adds marker show/hide functionality
			var moveAll = center;
			showHideMarkers(markers, paths, moveAll, map);

			// adds slide update functionality to the map
			slideUpdateMap(map, choro, color, slider, isos);
		}
	});

	// builds the legend of the map
	buildLegend(map, width, height, margin, firstColor, lastColor, domain, isos);
};

/*
* Uses slider input to update the map colors.
*/
function slideUpdateMap(map, choro, color, slider, isos) {

	slider.on('input', function() {

		// build a new mapData dict and update map
		var season = this.value,
			mapData = mapDataBuilder(season, color, choro, isos);
		map.updateChoropleth(mapData);
	});
};

/*
* Builds the bar next to the map and adds functionality. Adds the space to the * right defined in the margin object to make space for the legend. pBar sets 
* the height of the bar as a fraction of the height of the map.
*/
function buildLegend(map, width, height, margin, firstColor, lastColor, domain, isos, pBar = 2 / 3, barWidth = 10) {

	// adds some margin to the right
	map.svg.attr('width', width + margin.right);

	// creates a definition element for legend
	var defs = map.svg.append("defs");

	// sets vertical gradient from 0 to 100%, no horizontal gradient
	var legendBar = defs.append("linearGradient")
		.attr("id", "linear-gradient")
		.attr("x1", "0%")
		.attr("y1", "0%")
		.attr("x2", "0%")
		.attr("y2", "100%");

	// sets the color for the start at 0% of the firstColor value
	legendBar.append("stop") 
		.attr("offset", "0%")   
		.attr("stop-color", firstColor);

	// sets the color for the end at 100% of the lastColor value
	legendBar.append("stop") 
		.attr("offset", "100%")   
		.attr("stop-color", lastColor);

	// sets the legendBar dimensions
	var barHeight = pBar * height,
		barStart = (height - barHeight) / 2,
		barEnd = barStart + barHeight;

	// returns a float representation of the number of races
	var getLegendValue = d3.scale.linear().domain([barStart, barEnd])
		.range(domain);

	// fill with value from on mousemove function.
	var value;

	// displays a tip div with the number of races coupled to the legendBar
	var tip = d3.tip().html(function() {

	 	return "<span>Races: " + value + "</span>";
	})
	.offset(function() {
		return [d3.event.offsetY - barStart + 10, 0]; 
	})
	.attr('class', 'bar tip');

	// call the tooltip
	map.svg.call(tip);

	// select all countries
	var countries = map.svg.selectAll('.datamaps-subunit');

	// draw the rectangle and fill with gradient
	map.svg.append("rect")
		.attr("width", barWidth)
		.attr("height", barHeight)
		.attr('x', width + barWidth)
		.attr('y', barStart)
		.style("fill", "url(#linear-gradient)")
		.on('mousemove', function() {

			value = Math.round(getLegendValue(d3.event.offsetY));
			tip.show();
			borderChange(map, isos, value);
		})
		.on('mouseout', tip.hide);
};

/*
* Adds marker show hide functionality.
*/
function showHideMarkers(markers, paths, moveAll, map) {

	// show circle functionality
	var radio0 = d3.select('#radio0'),
		radio1 = d3.select('#radio1');

	// groups circle transitions
	var duration = 1000,
		t  = markers.circles.transition().duration(duration),
		d = markers.circles.transition().delay(duration);

	// show all circuit circles with radio button
	radio0.on('change', function() {
		markers.circles
			.transition(t)
				.attr('r', markers.radius)
				.style('display', null);
	});

	// hide all circuit circles with radio button
	radio1.on('change', function() {
		markers.circles
			.transition(t)
				.attr('r', 0)
			.transition(d)
				.style('display', 'none');
	});

	// centers on path on click and moves circles
	paths.on('click', function(d) {

		moveAll(d);

		// if the user clicks the correct button
		if (radio1.property('checked')) {

			// selects the circle based on the country id in class
			markers.circles.filter('.' + d.id)
				.transition(t)
					.attr('r', markers.radius)
					.style('display', null);

			// selects previous selection
			map.svg.selectAll('circle[r = "' + markers.radius + '"]')
				.transition(t)
					.attr('r', 0)
				.transition(d)
					.style('display', 'none');
		};
	});
};

/*
* Changes the width of borders of countries with a data value equal to the one 
* selected with the legend bar. Changes the borderwidth back to the one set in
* dataMaps for any country with another data value.
*/
function borderChange(map, isos, value, borderThickness = 3, defaultThickness = 0.25) {

	// selects data stored in paths
	var countryData = map.options.data;

	isos.forEach(function(iso) {

		var path = map.svg.select('.datamaps-subunit.' + iso);

		if (value == countryData[iso].races) {

			// change the selected country
			path.transition()
				.duration(250)
				.style('stroke-width', borderThickness);
		}
		else if (path.style('stroke-width') != map.options.geographyConfig.borderWidth) {

			// change other selection back
			path.transition()
				.delay(250)
				.style('stroke-width', map.options.geographyConfig.borderWidth);
		}
	});
};

/*
* Builds the data dict in Datamaps format. Used to initialise and update the 
* map data and colors for a given dataset.
*/
function mapDataBuilder(season, color, data, isos) {

	// select the dataset for the selected season via the slider
	var isoData = data[season],
		mapData = {};

	isos.forEach(function(iso) {
		var value = isoData[iso];

		mapData[iso] = {
			fillColor: color(value),
			races: value
		}
	});
	return mapData;
};

/*
* Builds a gradient function that, when given an integer, returns a hex color
* string. The defaultFillValue will be given the defaultFill color, different 
* from the linear scale.
*/
function gradientBuilder(defaultFill, fromColor, toColor, step, domain, defaultFillValue = 1) {

	// sets start and stop values for linear scale
	var start = domain[0] + step,
	stop = domain[1];

	// builds a linear scale with the domain and colors
	var linearColor = d3.scale.linear().domain([start, stop]).range([fromColor, toColor]);

	// sets the 'value: color' combination not following the linear scale
	var colorDomain = [defaultFillValue],
		colorRange = [defaultFill];

	for (var i = 0; i < stop; i += step) {

		// offsets colors and values by 1 step size
		colorDomain.push(i + 2 * step);
		colorRange.push(linearColor(i + step));
	};
	return d3.scale.threshold().domain(colorDomain).range(colorRange);
};

/*
* Draw the markers at circuit location and adds a popup and click event
*/
function drawMarkers(data, map) {

	// sets the radius of the markers
	var circleRadius = 4;

	map.bubbles(data, {
		popupTemplate: function (geo, data) {
			return [
				'<div class="hoverinfo"' + data.circuitId + '>',
				'<br/>' + data.circuit_name + '',
				'</div>'
				].join('');
		},
		fillOpacity: 0.8,
		highlightFillOpacity: 1,
        highlightBorderWidth: 4,
        highlightBorderColor: 'rgba(153, 153, 153, 0.8)',
        radius: circleRadius
	});

	// select all circles
	var circles = d3.selectAll('.datamaps-bubble');

	// set class names coupled to geo for hiding and showing circles
	circles
		.attr('r', circleRadius)
		.attr('class', function(d) { return 'datamaps-bubble ' + d.country });

	// returns selection for later zoom and pan functions
	return {
		circles: circles, 
		radius: circleRadius
	};
};

/*
* Draws empty axes to be filled with data.
*/
function buildLineChart(laptimes, winners, rules, markers) {

	// mock domain to be updated by data
	var xDomain = [0, 0],
		yDomain = [0, 0];

	// sets margins
	var svg = d3.select("#lineGraph"),
		margin = {top: 20, right: 20, bottom: 50, left: 50},
		width =+ svg.attr("width") - margin.left - margin.right,
		height =+ svg.attr("height") - margin.top - margin.bottom;

	// sets scales
	var xScale = d3.time.scale().range([0, width]).domain(xDomain),
		yScale = d3.time.scale().range([height, 0]).domain(yDomain);

	// appends lines container
	var g = svg.append("g")
		.attr('id', 'lineGraphG')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// sets the line function
	var line = d3.svg.line()
		.x(function(d) { return xScale(d.season); })
		.y(function(d) { return yScale(d.time); });

	// sets the x and y axes with empty ticks
	var xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickFormat(""), 
		yAxis = d3.svg.axis().scale(yScale).orient('left').tickFormat("");

	// appends the x axis
	g.append('g')
		.attr('class', 'x axis')
 		.attr('transform', 'translate(0, ' + height + ')')
		.call(xAxis);

	// appends the y axis
	g.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.attr('text-anchor', 'end')
			.text('Laptimes');

	// creates line container on graph
	g.append('path')
		.attr('class', 'line');

	// creates a focus element
	createFocus(g, width, height, markers.radius);

	// handles the update
	markers.circles.on('click', function(d) {

		var circuitLaptimes = laptimes[d.circuitId];
		forceValue(circuitLaptimes);
		updateLineGraph(circuitLaptimes);
		updateTitle('circuit', d.circuit_name);
		updateTitle('time', '');
	});

	/*
	* Updates the line graph with new laptime data.
	*/
	function updateLineGraph(laptimes) {

		// updates domains
		xDomain = d3.extent(laptimes, function(d) { return d.season; })
		yDomain = d3.extent(laptimes, function(d) { return d.time; });

		// sets axes
		xAxis.scale(xScale.domain(xDomain))
			.tickFormat(d3.time.format("%Y"));
		yAxis.scale(yScale.domain(yDomain))
			.tickFormat(d3.time.format("%M:%S"));

		// sets semi grouped transition
		svg = d3.select("#lineGraph").transition();

		// update y-axis
		svg.select('.y.axis')
			.duration(750)
			.call(yAxis);

		// update x-axis
		svg.select('.x.axis')
			.duration(750)
			.call(xAxis)
			.selectAll('text')
			.attr("dx", "-.5em")
			.attr("dy", ".5em")
			.attr("transform", "rotate(-45)")
			.style("text-anchor", "end");

		// updates line with tween interpolation
		svg.select('.line').delay(150)
			.duration(500)
			.attrTween('d', function (d) {
				var previous = d3.select(this).attr('d');
				return d3.interpolatePath(previous, line(laptimes));
			});

		var lineCircles = d3.select('#lineGraphG').selectAll('.lineCircle')
			.data(laptimes);

		lineCircles.exit().transition()			// remove excess circles
			.duration(250)
			.attr('r', 0)
			.remove();

		lineCircles.enter().append("circle");	// append new circles

		// handles the circle animation
		lineCircles
			.transition().duration(250)		// slowly decrease radius
				.attr('r', 0)	
			.transition().delay(250)		// delay the immediate shift
				.attr("cx", function(d) { return xScale(d.season); })
				.attr("cy", function(d) { return yScale(d.time); })
			.transition().duration(250)		// slowly increase radius
				.attr('r', 5)
				.attr('class', 'lineCircle');

		// stores the current dict in the data list selected by the mouse
		var d0, season;

		// selects focus elements
		var overlay = d3.select("#lineGraph").selectAll('.overlay'),
			mousePoint = d3.select('.focus');

		overlay
			.on('mouseover', function() { mousePoint.style('display', null); })
			.on('mouseout', function() { mousePoint.style('display', 'none'); })
			.on('mousemove', function() {

				var mouseX = d3.mouse(this)[0];		// get mouse x coordinate
				d0 = getTrueData(laptimes, xScale, mouseX);

				// updates the title
				season = timeParse(d0.season, '%Y');
				var time = timeParse(d0.time, '%M:%S:%L'),
					titleText = ' ' + season + ': ' + time;

				updateTitle('time', titleText);

				// updateTitle('time', text);
				var x = xScale(d0.season), 			// true date x-coordinate
					y = yScale(d0.time); 			// true date y-coordinate

				// update X-focusline
				mousePoint.select('#focusLineX')
					.attr('x1', x)
					.attr('y1', yScale(yDomain[0]))
					.attr('x2', x)
					.attr('y2', yScale(yDomain[1]));

				// update Y-focusline
				mousePoint.select('#focusLineY')
					.attr('x1', xScale(xDomain[0]))
					.attr('y1', y)
					.attr('x2', xScale(xDomain[1]))
					.attr('y2', y);

				// update tracking circle
				mousePoint.select('#focusCircle')
					.attr('cx', x)
					.attr('cy', y);
			})
			.on('click', function() { 

				buildPieChart(winners, laptimes, rules, overlay, xScale, season);
				changeRules(rules, season);
				updateTitle('season0', season + ' F1 World Championship');
			});
	};

};

function createFocus(g, width, height, radius) {

	// creates focus container
	var mousePoint = g.append('g')
		.attr('class', 'focus')
		.style('display', 'none');

	// appends the X-axis crosshair line
	mousePoint.append('line')
		.attr('id', 'focusLineX')
		.attr('class', 'focusLine')
		.style('stroke-dasharray', ('8, 2'));
	
	// appends the Y-axis crosshair line
	mousePoint.append('line')
		.attr('id', 'focusLineY')
		.attr('class', 'focusLine')
		.style('stroke-dasharray', ('8, 2'));
	
	// appends the tracking circle
	mousePoint.append('circle')
		.attr('id', 'focusCircle')
		.attr('r', radius)
		.attr('class', 'focusCircle');

	// appends the overlay class
	g.append('rect')
		.attr('class', 'overlay')
		.attr('width', width)
		.attr('height', height);
};

/*
* General update function for title html elements.
*/
function updateTitle(className, text) {
	d3.selectAll('.' + className).html(text);
};

/*
* From current mouse coordinates on a graph, returns data closest to the 
* location of the mouse.
*/
function getTrueData(laptimes, xScale, mouseX) {

	var mouseDate = xScale.invert(mouseX), 				// mousedate
	i = dataIndex(laptimes, mouseDate), 				// index to mouse date
	d0 = laptimes[i - 1], 								// trailing data
	d1 = laptimes[i]; 									// leading data

	// return the data closest to the mouse
	return mouseDate - d0.season > d1.season - mouseDate ? d1 : d0;
};

/*
* Given a dataset (list) and a value, returns the index of the dict where the 
* value is stored.
*/
function dataIndex(data, mouse) {
	return d3.bisector(function(d) { return d.season; }).left(data, mouse);
};

/*
* Builds the pie chart with a dataset of winners.
*/
function buildPieChart(winners, laptimes, rules, overlay, xScale, season) {

	// init on constructor data for user selected season
	var data = winners[season]['constructor'];

	console.log('DO: makePieChart', '\nData: ');
	console.log(data);

	// sets dimensions
	var width = 250,
		height = 250,
		radius = Math.min(width, height) / 2;

	var color = d3.scale.category20();

	var arc = d3.svg.arc()
		.outerRadius(radius - 20);

	var pie = d3.layout.pie()
		.value(function(d) { return d.value; })
		.sort(null);

	var svg = d3.select("#pieChart")
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	// sets beginning angles for all paths
	var enterClockwise = {
		startAngle: 0,
		endAngle: 0
	};

	// enters paths
	var path = svg.selectAll("path")
		.data(pie(data))
		.enter().append("path")
			.attr('class', function(d) { return (d.data.label).replace(/\s/g, '_'); })
			.attr("fill", function(d, i) { return color(i); })
			.attr("d", arc(enterClockwise))
			.each(function(d) {

				// stores angle values for later transition
				this._current = {
		 			data: d.data,
					value: d.value,
					startAngle: enterClockwise.startAngle,
					endAngle: enterClockwise.endAngle
				}
			});

	// uses stored values to update to the final pie chart
	path.transition()
		.duration(1000)
		.attrTween("d", arcTween);

	// sets the layout of the html text of the tooltip
	var tip = d3.tip().html(function(d) {
		console.log(d);
	 	return "<span>Team: " + d.data.label + "</br>Wins: " + d.data.value + "</span>";
	})
	.attr('class', 'piechart tip');

	// calls the tooltip
	svg.call(tip);

	// shows and hides tip for pie chart
	path.on('mouseover', tip.show)
	.on('mouseout', tip.hide);

	// handles the update of the pie chart
	overlay.on('click', function() {

		// get the season from the line chart click
		var mouseX = d3.mouse(this)[0],
			d0 = getTrueData(laptimes, xScale, mouseX),
			season = timeParse(d0.season, '%Y'),
			data = winners[season]['constructor'];

		updatePie(data);
		changeRules(rules, season);
		updateTitle('season0', season + ' F1 World Championship');
	});

	/*
	* Updates the pie chart with new data.
	*/
	function updatePie(data) {

		// update the data
		path = path.data(pie(data));

		// redraws the arcs
		path.transition().duration(750).attrTween("d", arcTween);
	};

	/*
	* Handles the interpolation between two arced path elements.
	*/
	function arcTween(a) {

		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function(t) { return arc(i(t)); };
	};
};

/*
* Changes text in tables according to selected season. If the selected season * has no data, then the left index is chosen. If an element is empty, then the
* index is decreased until a non empty value is found for the key. Index 
* resets for any other keys with empty values.
*/
function changeRules(rules, season, bisector) {

	// create a list of seasons with rule changes and select an index
	var seasons = Object.keys(rules),
		i = d3.bisector(function(d) { return d }).left(seasons, season) - 1;

	var data;

	// checks if rules changed in this season
	if (rules[season]) {
		data = rules[season];
	}
	else {
		season = seasons[i];	// TODO: remove debug
		data = rules[seasons[i]];
	};

	// loops over keys in rule change dict
	Object.keys(data).forEach(function(key) {

		// selects table row and text to be added to the row (if any)
		var table = d3.select('.' + key),
			text = data[key];

		if (text) {
			table.html(text);
		}
		else {
			// reset back to original index for new key: text element
			var j = i,
				text = rules[seasons[j]][key];

			// while key string is empty for previous seasons reduces season
			while (!text) {
				j--;
				text = rules[seasons[j]][key];
			};
			table.html(text);
		};
	});
};

/*
* Formats race dataset. Years are interpreted as Dates. Otherwise, axis
* interpreted Date as an integer and added a comma delimiter. Millisecond 
* input is interpreted correctly and translated to correct output in line graph
*/
function forceValue(data) {

	data.forEach(function(d) {
		d.time = new Date(d.time);
		d.season = new Date(d.season);
	});
	return data;
};

/*
* Takes a date object and returns the year. The format string is a d3 
* acceptable parse string. Link:
* https://github.com/d3/d3-3.x-api-reference/blob/master/Time-Formatting.md
*/
function timeParse(dateObject, formatString) {
	return d3.time.format(formatString)(dateObject);
};