var updateDict;

// load the DOM and d3 second
window.onload = function() {

	updateDict = buildUpdate();

	var relDataPath = '../data/';

	d3.queue()
		.defer(d3.json, relDataPath + 'circuit_races.json')
		.defer(d3.json, relDataPath + 'choro_races.json')
		.defer(d3.json, relDataPath + 'winners.json')
		.defer(d3.json, relDataPath + 'test1.json')
		.await(mainFunction);
};

/*
* Main Function.
*/
function mainFunction(error, race_data, choroData, winners_data, markerData) {

	if (error) throw error;

	// set global data
	circuits = markerData;
	races = race_data;
	winners = winners_data;

	drawMap(markerData, choroData);
	drawLineAxes();
};

/*
* Draw the markers for the map
*/
function drawMap(data, choro) {

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
	INITSEASON = slider.attr('value');

	// build a mapData dict to initialise map
	var mapData = mapDataBuilder(INITSEASON, color, choro);

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

			var circles = markers.circles;
			var circleRadius = markers.radius;

			var projection = map.projection;

			var zoom = d3.behavior.zoom()
				.translate(projection.translate())
				.scale(projection.scale())
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
				projection.translate(d3.event.translate).scale(d3.event.scale);
				paths.attr("d", path);

				circles
					.attr("cx", function(d) { 
						return projection([d.longitude ,d.latitude])[0]
					})
					.attr("cy", function(d) { 
						return projection([d.longitude, d.latitude])[1]
					});
			};

			/*
			* Given path data, calculates the center of the path and moves map * to the new center location. Updates both paths and circles.
			*/
			function center(d) {

				var centroid = path.centroid(d),
				translate = projection.translate();

				// calculates correct coordinates
				var x = translate[0] - centroid[0] + width / 2,
				y = translate[1] - centroid[1] + height / 2;

				projection.translate([x, y]);

				zoom.translate(projection.translate());

				paths.transition()
					.duration(1000)
					.attr("d", path);

				circles.transition()
					.duration(890)
					.attr("cx", function(d) { 
						return projection([d.longitude ,d.latitude])[0]
					})
					.attr("cy", function(d) { 
						return projection([d.longitude, d.latitude])[1]
					});
			};

			var moveAll = center;
			showHideMarkers(markers, paths, moveAll, map);
		}
	});

	// Update the current slider value (each time you drag the slider handle)
	slider.on('input', function() {

		// build a new mapData dict and update map
		var season = this.value,
		mapData = mapDataBuilder(season, color, choro)
		map.updateChoropleth(mapData);
	});

	// // select all countries
	var countries = map.svg.selectAll('.datamaps-subunit');

	buildLegend();

	function buildLegend() {

		// add some margin to the right
		map.svg.attr('width', width + margin.right);

		// create a definition element for legend
		var defs = map.svg.append("defs");

		var legendBar = defs.append("linearGradient")
			.attr("id", "linear-gradient");

		// vertical gradient from 0 to 100%
		legendBar
			.attr("x1", "0%")
			.attr("y1", "0%")
			.attr("x2", "0%")
			.attr("y2", "100%");

		// set the color for the start (0%)
		legendBar.append("stop") 
			.attr("offset", "0%")   
			.attr("stop-color", firstColor);

		// set the color for the end (100%)
		legendBar.append("stop") 
			.attr("offset", "100%")   
			.attr("stop-color", lastColor);

		// sets the legendBar dimensions
		var barWidth = width / 40,
		barHeight = height - (height / 3);

		// returns a float representation of the number of races
		var getRaceNumber = d3.scale.linear().domain([50, barHeight + 50])
			.range(domain);

		// displays a tip div with the number of races coupled to the legendBar
		var tip = d3.tip().html(function() {
		 	return "<span>Races: " + Math.round(getRaceNumber(d3.event.offsetY)) + "</span>";
		})
		.offset(function() { return [d3.event.offsetY - 39, 0]; })
		.attr('class', 'd3-tip');

		// call the tooltip
		map.svg.call(tip);

		// draw the rectangle and fill with gradient
		map.svg.append("rect")
			.attr("width", barWidth)
			.attr("height", barHeight)
			.attr('x', width + barWidth)
			.attr('y', barHeight / 4)
			.style("fill", "url(#linear-gradient)")
			.on('mousemove', function() {

				tip.show();
				borderChange(countries, getRaceNumber);
			})
			.on('mouseout', tip.hide);
	};
};

function showHideMarkers(markers, paths, moveAll, map) {

	// show circle functionality
	var radio0 = d3.select('#radio0');
	var radio1 = d3.select('#radio1');

	var circles = markers.circles;
	var radius = markers.radius;

	// groups circle transitions
	var t  = circles.transition().duration(1000);

	// show all circuit circles with radio button
	radio0.on('change', function() {
		circles.transition(t).attr('r', radius);
	});

	// hide all circuit circles with radio button
	radio1.on('change', function() {
		circles.transition(t).attr('r', 0);
	});

	// centers on path on click and moves circles
	paths.on('click', function(d) {

		moveAll(d);

		// if the user clicks the correct button
		if (radio1.property('checked')) {

			// selects the circle based on the country id in class
			circles.filter('.' + d.id)
				.transition(t)
				.attr('r', radius);

			// selects previous selection
			map.svg.selectAll('circle[r = "' + radius + '"]').transition(t)
				.attr('r', 0);
		};
	});
};

/*
* Uses the map legend as input and accesses the 
*/
function borderChange(paths, getRaceNumber) {

	// get value from legendBar
	var value = Math.round(getRaceNumber(d3.event.offsetY));

	// loop over all paths
	paths[0].forEach(function(d) {

		var path = d3.select(d);

		// JSONifies data-info attribute of path and gets value
		if (path.attr('data-info') && JSON.parse(path.attr('data-info')).races == value) {

			path.transition()
				.duration(250)
				.style('stroke-width', 2);
		}
		else if (path.style('stroke-width') != 0.25) {

			path.transition()
				.delay(250)
				.style('stroke-width', 0.25);
		};
	});
};

/*
* Builds the data dict in Datamaps format. Used to initialise and update the 
* map data and colors for a given dataset.
*/
function mapDataBuilder(season, color, data) {

	mapData = {},
	isos = Object.keys(data[season]);

	isos.forEach(function(iso) {
		mapData[iso] = {
			fillColor: color(data[season][iso]),
			races: data[season][iso]
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

	// builds the linear scale for the rest of the values
	for (var i = 0; i < stop; i += step) {

		// offsets colors and values by 1 step size
		colorDomain.push(i + 2 * step);
		colorRange.push(linearColor(i + step));
	};

	// returns the semi gradient function
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
			return ['<div class="hoverinfo"' + data.circuitId + '>',
			'<br/>' + data.circuit_name + '',
			'</div>'].join('');
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
		.attr('class', function(d) { return 'datamaps-bubble ' + d.country })
		.on('click', function(bubble) {

			var circuitId = bubble.circuitId;

			// select new data for line graph
			var newData = races[circuitId]['data'];
			
			// force into season into date objects
			forceValue(newData);
			updateLineGraph(newData, circuitId);
		});

	// returns selection for later zoom and pan functions
	return {
		circles: circles, 
		radius: circleRadius
	};
};

/*
* Draws empty axes to be filled with data.
*/
function drawLineAxes() {

	// gets graph variables
	var graph = updateDict.graph,
	g = graph.g;

	g.append('g')
		.attr('class', 'x axis')
 		.attr('transform', 'translate(0, ' + graph.height + ')')
		.call(graph.xAxis);

	g.append('g')
		.attr('class', 'y axis')
		.call(graph.yAxis)
		.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.attr('text-anchor', 'end')
			.text('Laptimes');

	// creates line container on graph
	g.append('path')
		.attr('class', 'line');

	// create focus container
	var mousePoint = g.append('g')
		.attr('class', 'focus')
		.style('display', 'none');

	// append the X-axis crosshair line
	mousePoint.append('line')
		.attr('id', 'focusLineX')
		.attr('class', 'focusLine')
		.style('stroke-dasharray', ('8, 2'));
	
	// append the Y-axis crosshair line
	mousePoint.append('line')
		.attr('id', 'focusLineY')
		.attr('class', 'focusLine')
		.style('stroke-dasharray', ('8, 2'));
	
	// append the tracking circle
	mousePoint.append('circle')
		.attr('id', 'focusCircle')
		.attr('r', 4)
		.attr('class', 'focusCircle');

	// append the overlay class
	g.append('rect')
		.attr('class', 'overlay')
		.attr('width', graph.width)
		.attr('height', graph.height);
};

function updateLineGraph(newData, circuitId) {

	// set domains
	var xDomain = d3.extent(newData, function(d) { return d.season; })
	var yDomain = d3.extent(newData, function(d) { return d.time; });

	// gets graph variables
	var graph = updateDict.graph;

	// set axes
	graph.xAxis.scale(graph.xScale.domain(xDomain));
	graph.yAxis.scale(graph.yScale.domain(yDomain));

	// Select the section we want to apply our changes to
	var svg = d3.select("#lineGraph").transition();

	console.log(newData);

	// update x-axis
	svg.select('.y.axis')
		.duration(750)
		.call(graph.yAxis);

	// update y-axis
	svg.select('.x.axis')
		.duration(750)
		.call(graph.xAxis);

	// update line with difference interpolation
	svg.select('.line')
		.duration(750)
		.attrTween('d', function (d) {
			var previous = d3.select(this).attr('d');
			return d3.interpolatePath(previous, graph.line(newData));
		});

	// TODO find out why selection requires g element
	var circle = d3.select('#lineGraphG').selectAll('.lineCircle')
		.data(newData);

	circle.exit().transition()	// remove excess elements
		.duration(250)
		.attr('r', 0)
		.remove();

	circle.enter().append("circle")		// append new circles
		.attr('r', 0)
		.attr('class', '.lineCircle');

	circle.transition()		// first shift to correct locations
		.duration(750)
			.attr("cx", function(d) { return graph.xScale(d.season); })
			.attr("cy", function(d) { return graph.yScale(d.time); })
		.transition()		// then increase radius
		.duration(250)
			.attr('r', 5)
			.attr('class', 'lineCircle');

	var mousePoint = d3.select('.focus');
	var bisectDate = d3.bisector(function(d) { return d.season; }).left;

	// Update the focus elements
	d3.select("#lineGraph").selectAll('.overlay')
		.on('mouseover', function() { mousePoint.style('display', null); })
		.on('mouseout', function() { mousePoint.style('display', 'none'); })
		.on('mousemove', function() {

			var mouse = d3.mouse(this),				// get mouse coordinates
			d = getTrueData(mouse),
			x = graph.xScale(d.season), 			// true date x-coordinate
			y = graph.yScale(d.time); 				// true date y-coordinate

			// update X-focusline
			mousePoint.select('#focusLineX')
				.attr('x1', x)
				.attr('y1', graph.yScale(yDomain[0]))
				.attr('x2', x)
				.attr('y2', graph.yScale(yDomain[1]));

			// update Y-focusline
			mousePoint.select('#focusLineY')
				.attr('x1', graph.xScale(xDomain[0]))
				.attr('y1', y)
				.attr('x2', graph.xScale(xDomain[1]))
				.attr('y2', y);

			// update tracking circle
			mousePoint.select('#focusCircle')
				.attr('cx', x)
				.attr('cy', y);
		})
		.on('click', function() { 
			
			var mouse = d3.mouse(this),				// get mouse coordinates
			d = getTrueData(mouse),
			season = timeParse(d.season);			// parse into season format

			// access winner data of correct season
			var data = winners[season];

			// TODO find better way differentiate between the update and draw
			if (d3.select('#pieChart').select('g').empty() == true) {

				// builds the pie chart
				makePieChart(data);
			}
			else {

				// TODO update pie chart here
				updatePie(data);
			}
		});

	/*
	* From current mouse coordinates on a graph, returns data closest to the 
	* location of the mouse.
	*/
	function getTrueData(mouseCoordinates) {

		var mouseDate = graph.xScale.invert(mouseCoordinates[0]), // mousedate
		i = bisectDate(newData, mouseDate), 			// index to mouse date
		d0 = newData[i - 1], 							// trailing data
		d1 = newData[i]; 								// leading data

		// return the data closest to the mouse
		return mouseDate - d0.season > d1.season - mouseDate ? d1 : d0;
	};
};

function makePieChart(data) {

	console.log('DO: makePieChart', '\nData: ');
	console.log(data);

	var width = 250,
	height = 250,
	radius = Math.min(width, height) / 2;

	var color = d3.scale.category20();

	var arc = d3.svg.arc()
		.outerRadius(radius - 20);

	// TODO sorting defaults to descending order, set data to descending and disable sort with pie().sort(null) default sort produces a visual bug where whitespace is created on change.
	var pie = d3.layout.pie()
		.value(function(d) { return d.value; })
		.sort(null);

	var svg = d3.select("#pieChart")
		.append("g")
		 .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var enterClockwise = {
		startAngle: 0,
		endAngle: 0
	};

	var path = svg.selectAll("path")
	.data(pie(data))
	.enter().append("path")
		.attr("fill", function(d, i) { return color(i); })
		.attr("d", arc(enterClockwise))
		.each(function(d) {
		this._current = {
		 	data: d.data,
			value: d.value,
			startAngle: enterClockwise.startAngle,
			endAngle: enterClockwise.endAngle
		}
		}); // store the initial values

	// use stored values to update to the final pie chart
	path.transition()
		.duration(750)
		.attrTween("d", arcTween);
};

/*
* TODO Functions need arc function to work.
*/
function arcTween(a) {

	// TODO
	var arc = d3.svg.arc()
		.outerRadius(125 - 20);

	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) { return arc(i(t)); };
};

/*
* TODO Functions need arc function to work.
*/
function arcTweenOut(a) {

	// TODO
	var arc = d3.svg.arc()
		.outerRadius(125 - 20);

	var i = d3.interpolate(this._current, {
		startAngle: Math.PI * 2, endAngle: Math.PI * 2, value: 0
	});

	this._current = i(0);
	return function (t) { return arc(i(t)); };
};

function updatePie(data) {

	console.log('updatePie', '\nData: ');
	console.log(data);

	// TODO better selection by adding id to g element
	var path = d3.select('#pieChart').select('g').selectAll('path'),
	pie = d3.layout.pie()
		.value(function(d) { return d.value; })
		.sort(null),

	arc = d3.svg.arc()
		.outerRadius(125 - 20),

	enterAntiClockwise = {
		startAngle: Math.PI * 2,
		endAngle: Math.PI * 2
	},

	color = d3.scale.category20();

	path = path.data(pie(data)); // update the data

	// set the start and end angles to Math.PI * 2 so we can transition
	// anticlockwise to the actual values later
	path.enter().append("path")
		.attr("fill", function (d, i) {
			return color(i);
		})
		.attr("d", arc(enterAntiClockwise))
		.each(function (d) {
			this._current = {
			data: d.data,
			value: d.value,
			startAngle: enterAntiClockwise.startAngle,
			endAngle: enterAntiClockwise.endAngle
			};
		}); // store the initial values

	path.exit()
		.transition()
		.duration(750)
		.attrTween('d', arcTweenOut)
		.remove() // now remove the exiting arcs

	path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
};

function buildUpdate() {

	var dict = {};
	dict['graph'] = graphUpdate();

	// return update dict
	return dict;

	/*
	* Set all functions and variables to update the line graph.
	*/
	function graphUpdate() {

		// mock domain to be updated by data, use invalid date to not show a tick
		var dateDomain = ['invalid Date', 'invalid Date'],
		laptimeDomain = [0, 0];

		var svg = d3.select("#lineGraph"),
		margin = {top: 20, right: 20, bottom: 30, left: 50},
		width =+ svg.attr("width") - margin.left - margin.right,
		height =+ svg.attr("height") - margin.top - margin.bottom;

		// set scales
		var xScale = d3.time.scale().range([0, width]).domain(dateDomain),
		yScale = d3.scale.linear().range([height, 0]).domain(laptimeDomain);

		var dict = {
			'g': svg.append("g")
				.attr('id', 'lineGraphG')
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"), 
			'line': d3.svg.line()
				.x(function(d) { return xScale(d.season); })
				.y(function(d) { return yScale(d.time); }), 
			'width': width, 
			'height': height, 
			'xScale': xScale, 
			'xAxis': d3.svg.axis().scale(xScale).orient('bottom')
				.tickFormat(d3.time.format("%Y")), 
			'yScale': yScale, 
			'yAxis': d3.svg.axis().scale(yScale).orient('left')
		};

		// return graph update dict
		return dict;
	};
};

/*
* Formats race dataset. Years are interpreted as Dates. Otherwise, axis
* interpreted Date as an integer and added a comma delimiter.
*/
function forceValue(data) {

	data.forEach(function(d) {
		d.season = new Date(d.season);
	});

	return data;
};

/*
* Takes a date object and returns the year.
*/
function timeParse(date) {

	return d3.time.format("%Y")(date);
};