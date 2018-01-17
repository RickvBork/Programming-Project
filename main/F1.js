var updateDict,
datum = [];

// load the DOM and d3 second
window.onload = function() {

	updateDict = buildUpdate();

	var relDataPath = '../data/';

	d3.queue()
		.defer(d3.json, relDataPath + 'circuit_map.json')
		.defer(d3.json, relDataPath + 'circuit_races.json')
		.defer(d3.json, relDataPath + 'choro_races.json')
		.defer(d3.json, relDataPath + 'winners.json')
		.await(mainFunction);
};

/*
* Main Function.
*/
function mainFunction(error, circuits_data, race_data, choro, winners) {

	if (error) throw error;

	console.log(winners);

	// set global data
	circuits = circuits_data;
	races = race_data;

	drawMap(circuits, choro);
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
	var firstColor = '#f4f4f4',
	lastColor = '#ff1e00',
	step = 25,
	color = gradientBuilder(firstColor, lastColor, step, domain);

	// get the season on which the slider is initialised
	var slider = d3.select('#myRange'),
	INITSEASON = slider.attr('value');

	// build a mapData dict to initialise map
	var mapData = mapDataBuilder(INITSEASON, color, choro)

	// draws the world map in Mercator projection
	var map = new Datamap({element: document.getElementById('container'),	
		projection: 'mercator',
		geographyConfig: {
			popupTemplate: function(geography, data) { //this function should just return a string
          		return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
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
			'bubble': '#7f7f7f',

			// if default == first color in scale, countries with 0 races blend in background
			defaultFill: firstColor
		},
		data: mapData
	});

	// Update the current slider value (each time you drag the slider handle)
	slider.on('input', function() {

		// build a new mapData dict and update map
		var season = this.value,
		mapData = mapDataBuilder(season, color, choro)
		map.updateChoropleth(mapData);
	});

	// keep track of current map conditions
	var zoomScaleFactor = 1,
	translate = [0, 0];

	// select all countries
	var countries = map.svg.selectAll('.datamaps-subunit');

	// adds on click
	countries.on('click', function(d) {

		var centroid = map.path.centroid(d),
		bbox = this.getBBox();

		zoomScaleFactor = 300 / bbox.width;

		// 500, 300 placeholders for svg dimensions
		zoomX = -centroid[0] + zoomOffset(500, zoomScaleFactor),
		zoomY = -centroid[1] + zoomOffset(300, zoomScaleFactor);

		// keeps track of current location
		translate = [zoomX, zoomY];

		// set a transform on the parent group element creating a zoom
		map.svg.selectAll('g').transition()
			.duration(750)
			.attr("transform", "scale(" + zoomScaleFactor + ")" + "translate(" + translate + ")");

		/*
		* Pushes centroid to center of the zoomed in map
		*/
		function zoomOffset(dimension, zoom) {
			return (dimension / zoom) / 2;
		};

		// crude redraw of border width
		countries.transition()
			.duration(250)
			.style('stroke-width', 1 / zoomScaleFactor);

		console.log(d.id);
		console.log(translate);
	});

	map.svg.call(d3.behavior.zoom().on("zoom", redraw));

	function redraw() {
		map.svg.selectAll("g").attr("transform", "scale(" + zoomScaleFactor + ")" + "translate(" + d3.event.translate + ")");

		console.log(d3.event.translate);
	};

	//draw dots at circuit location
	drawMarkers(data, map);
};

/*
* Builds the data dict in Datamaps format. Used to initialise and update the 
* map.
*/
function mapDataBuilder(INITSEASON, color, data) {

	mapData = {},
	isos = Object.keys(data[INITSEASON]);

	isos.forEach(function(iso) {

		mapData[iso] = {
			fillColor: color(data[INITSEASON][iso]),
			races: data[INITSEASON][iso]
		}
	});

	return mapData;
};

/*
* Builds a gradient function that, when given an integer, returns a hex color
* string. 
*/
function gradientBuilder(fromColor, toColor, step, domain) {

	// make a linear scale with the domain and colors
	var linearColor = d3.scale.linear().domain(domain).range([fromColor, toColor]),
	colorDomain = [1],
	colorRange = [fromColor];
	for (var i = step; i < domain[1] + step; i += step) {

		colorDomain.push(i);
		colorRange.push(linearColor(i));
	};

	// return the gradient function
	return d3.scale.threshold().domain(colorDomain).range(colorRange);
};

/*
* Draw the markers at circuit location and adds a popup and click event
*/
function drawMarkers(data, map) {

	map.bubbles(data, {

		popupTemplate: function (geo, data) {

			return ['<div class="hoverinfo"' + data.circuitId + '>',
			'<br/>' +  data.circuit_name + '',
			'</div>'].join('');
		}
	});

	// get the name from a click on a bubble
	d3.selectAll(".datamaps-bubble").on('click', function(bubble) {
		
		// TODO for update pie
		var circuitId = bubble.circuitId;

		var dataNew = races[bubble.circuitId]['data'];
		datum.push(dataNew);
		update(dataNew, circuitId);
	});
};

/*
* Placeholder for all update functions
*/
function update(newData, circuitId) {

	// force into season into date objects
	forceValue(newData);

	var oldData = datum.shift();
	forceValue(oldData);
	updateLineGraph(oldData, newData, circuitId);
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

function updateLineGraph(oldData, newData, circuitId) {

	// TODO!
	if (oldData == newData) {
		// do something!
	};

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

	console.log(oldData, newData);

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

	var date;

	// Update the focus elements
	d3.select("#lineGraph").selectAll('.overlay')
		.on('mouseover', function() { mousePoint.style('display', null); })
		.on('mouseout', function() { mousePoint.style('display', 'none'); })
		.on('mousemove', function() {

			var mouse = d3.mouse(this),				// mouse coordinate array
			mouseDate = graph.xScale.invert(mouse[0]),		// a mouse date
			i = bisectDate(newData, mouseDate), 	// index to mouse date
			d0 = newData[i - 1], 					// trailing data
			d1 = newData[i], 						// leading data

			// true data
			d = mouseDate - d0.season > d1.season - mouseDate ? d1 : d0,
			x = graph.xScale(d.season), 			// true date x-coordinate
			y = graph.yScale(d.time); 				// true date y-coordinate

			date = d.season;

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
			season = timeParse(date);
			updatePie(season, circuitId);
		});
};

function makePieChart(data) {

	var c20 = d3.scale.category20();

	// some mock data
	var data = [
		{'team': 'Red Bull Racing', 'won': 9, 'color': 'purple'},
		{'team': 'McLaren Mercedes', 'won': 5, 'color': 'grey'},
		{'team': 'Ferrari', 'won': 5, 'color': 'red'}
	];

	var svg = d3.select("#pieChart"),
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width =+ svg.attr("width"),
	height =+ svg.attr("height");

	var radius = 100;

	var g = svg.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	// set arc generator function
	var arc = d3.svg.arc()
		.outerRadius(radius)
		.innerRadius(10);

	var pie = d3.layout.pie()
		.value(function(d) { return d.won; });

	var slices = g.selectAll(".slice")
		.data(pie(data))
		.enter().append("g")
		.attr("class", "slice")
	
	// make slices
	slices.append("path")
		.attr("d", arc)
		.attr("fill", function(d) { return d.data.color; });

	slices.append("text")
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		.style("text-anchor", "middle")
		.text(function(d) { return d.data.team; });
};

function buildUpdate() {

	// mock domain to be updated by data, use invalid date to not show a tick
	var dateDomain = ['invalid Date', 'invalid Date'],
	laptimeDomain = [0, 0];

	var svg = d3.select("#lineGraph"),
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width =+ svg.attr("width") - margin.left - margin.right,
	height =+ svg.attr("height") - margin.top - margin.bottom,

	// set transform container
	g = svg.append("g")
		.attr('id', 'lineGraphG')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

	// set scales
	xScale = d3.time.scale().range([0, width]).domain(dateDomain),
	yScale = d3.scale.linear().range([height, 0]).domain(laptimeDomain),

	// set axes
	xAxis = d3.svg.axis().scale(xScale).orient('bottom')
		.tickFormat(d3.time.format("%Y")),			// always show only years
	yAxis = d3.svg.axis().scale(yScale).orient('left'),

	// set line function
	line = d3.svg.line()
		.x(function(d) { return xScale(d.season); })
		.y(function(d) { return yScale(d.time); });

	var dict = {'graph': {'g': g, 'line': line, 'width': width, 'height': height, 'xScale': xScale, 'xAxis': xAxis, 'yScale': yScale, 'yAxis': yAxis}};

	return dict;
};

function updatePie(season, circuitId) {

	console.log('DO: updatePie', '\nseason: ' + season, '\ncircuitId: ' + circuitId);
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