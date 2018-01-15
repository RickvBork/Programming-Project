var updateDict,
datum = [];

// load the DOM and d3 second
window.onload = function() {

	updateDict = buildUpdate();

	var relDataPath = '../data/';

	d3.queue()
		.defer(d3.json, relDataPath + 'circuit_map.json')
		.defer(d3.json, relDataPath + 'circuit_races.json')
		.await(mainFunction);
};

/*
* Main Function
*/
function mainFunction(error, circuits_data, race_data) {

	if (error) throw error;

	// set global data
	circuits = circuits_data;
	races = race_data;

	drawMap(circuits);
};

/*
* Draw the markers for the map
*/
function drawMap(data) {

	// var fillColor = d3.scale.threshold()
	// 	.domain([.05, .10])
	// 	.range(['#333333', '#888888']);

	// keep track of current map conditions
	var zoomScaleFactor = 1;
	var translate = [0, 0];

	// draws the world map in Mercator projection
	var map = new Datamap({element: document.getElementById('container'),	
		fills: {
			'bubble': '#7f7f7f',
			defaultFill: 'rgb(171, 221, 164)'
		}
	});

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

		var selectedGeo = {'RUS': '#ED1ADF'};
		  selectedGeo[d.id] = '#ED1ADF';
		  map.updateChoropleth(selectedGeo);
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
		
		var dataNew = races[bubble.circuitId]['data'];
		datum.push(dataNew);
		update(dataNew);
	});
};

/*
* Placeholder for all update functions
*/
function update(newData) {

	// force into season into date objects
	forceValue(newData);

	// check is graph has been created
	if (d3.selectAll('#lineGraph').select('path').empty() == true) {

		// graph has not been created
		makeLineGraph(newData);
		makePieChart();
	}

	// user selected new circuit, update line graph
	else {

		// select old data and force into correct values
		var oldData = datum.shift();
		forceValue(oldData);

		// graph has been created
		updateLineGraph(oldData, newData);
	};
};

/*
* Draw the line graph
*/
function makeLineGraph(data) {
	
	// set domains
	var xDomain = d3.extent(data, function(d) { return d.season; })
	var yDomain = d3.extent(data, function(d) { return d.time; });

	// indexes
	var get = updateDict['line'],
	getX = get['x'],
	getY = get['y'];

	// get variables
	var g = get['g'],
	width = get['width'],
	line = get['line'],
	height = get['height'],
	xScale = getX['scale'],
	yScale = getY['scale'],
	xAxis = getX['axis'],
	yAxis = getY['axis'];

	// set scales
	var xScale = xScale.domain(xDomain);
	var yScale = yScale.domain(yDomain);

	// set axes
	var xAxis = xAxis.scale(xScale);
	var yAxis = yAxis.scale(yScale);

	g.append('g')
		.attr('class', 'x axis')
 		.attr('transform', 'translate(0, ' + height + ')')
			.call(xAxis);

	g.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.attr('text-anchor', 'end')
			.text('Test');

	// creates line on graph
	g.append('path')
		.attr('class', 'line')
		.attr('d', line(data));

	// creates circles on graph
	g.selectAll('circle')
		.data(data)
		.enter().append('circle')
		.attr('cx', function(d) { return xScale(d.season); })
		.attr('cy', function(d) { return yScale(d.time); })
		.attr('r', 5)
		.attr('class', 'circle');

	// add crosshair functionality
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

	// returns index to a date in data when given a valid date
	var bisectDate = d3.bisector(function(d) { return d.season; }).left;

	// selects correct index and hides and shows layers of mousePoint
	g.append('rect')
		.attr('class', 'overlay')
		.attr('width', width)
		.attr('height', height)
		.on('mouseover', function() { mousePoint.style('display', null); })
		.on('mouseout', function() { mousePoint.style('display', 'none'); })
		.on('mousemove', function() {

			var mouse = d3.mouse(this),				// mouse coordinate array
			mouseDate = xScale.invert(mouse[0]), 	// a mouse date
			i = bisectDate(data, mouseDate), 		// index to mouse date
			d0 = data[i - 1], 						// trailing data
			d1 = data[i], 							// leading data

			// true data
			d = mouseDate - d0.season > d1.season - mouseDate ? d1 : d0,
			x = xScale(d.season), 					// true date x-coordinate
			y = yScale(d.time); 					// true date y-coordinate

			// update X-focusline
			mousePoint.select('#focusLineX')
				.attr('x1', x).attr('y1', yScale(yDomain[0]))
				.attr('x2', x).attr('y2', yScale(yDomain[1]));

			// update Y-focusline
			mousePoint.select('#focusLineY')
				.attr('x1', xScale(xDomain[0])).attr('y1', y)
				.attr('x2', xScale(xDomain[1])).attr('y2', y);

			// update tracking circle
			mousePoint.select('#focusCircle')
				.attr('cx', x)
				.attr('cy', y);
		});
};

function updateLineGraph(oldData, newData) {

	// indexes
	var get = updateDict['line'],
	getX = get['x'],
	getY = get['y'];

	// get variables
	var line = get['line'],
	xScale = getX['scale'],
	yScale = getY['scale'],
	xAxis = getX['axis'],
	yAxis = getY['axis'];

	// set domains
	xScale.domain(d3.extent(newData, function(d) { return d.season; }));
	yScale.domain(d3.extent(newData, function(d) { return d.time; }));

	// Select the section we want to apply our changes to
	var svg = d3.select("body").transition();

	// update x-axis
	svg.select('.y.axis')
		.duration(750)
		.call(yAxis);

	// update y-axis
	svg.select('.x.axis')
		.duration(750)
		.call(xAxis);

	// update line
	svg.select('.line')
		.attrTween('d', function (d) {
			var previous = d3.select(this).attr('d');
			return d3.interpolatePath(previous, line(newData));
		});

	// update circles
};

function makePieChart() {

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

	// mock domain to be updated by data
	var tempDomain = [0, 0];

	var svg = d3.select("#lineGraph"),
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width =+ svg.attr("width") - margin.left - margin.right,
	height =+ svg.attr("height") - margin.top - margin.bottom,

	// set transform container
	g = svg.append("g")
		.attr('class', 't')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

	// set scales
	xScale = d3.time.scale().range([0, width]).domain(tempDomain),
	yScale = d3.scale.linear().range([height, 0]).domain(tempDomain),

	// set axes
	xAxis = d3.svg.axis().scale(xScale).orient('bottom'),
	yAxis = d3.svg.axis().scale(yScale).orient('left'),

	// set line function
	line = d3.svg.line()
		.x(function(d) { return xScale(d.season); })
		.y(function(d) { return yScale(d.time); });

	var dict = {'line': {'g': g, 'line': line, 'width': width, 'height': height, 'x': {'scale': xScale, 'axis': xAxis}, 'y': {'scale': yScale, 'axis': yAxis}}};

	return dict;
};

// formats race dataset
function forceValue(data) {
	data.forEach(function(d) {
		d.season = new Date(d.season);
	});

	return data;
};