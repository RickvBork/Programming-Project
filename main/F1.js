var circuit,
races;

// load the DOM and d3 second
window.onload = function() {

	d3.queue()
		.defer(d3.json, 'circuit_map.json')
		.defer(d3.json, 'circuit_races.json')
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
	
	// draws the world map in Mercator projection
	var map = new Datamap({element: document.getElementById('container'),	
		fills: {
			'bubble': '#7f7f7f',
			defaultFill: 'rgb(171, 221, 164)'
		}
	});

	// get the name from a click on a bubble
	d3.selectAll(".datamaps-bubble").on('click', function(bubble) {
		update(bubble.circuitId);
	});

	// var g = map.svg.selectAll('g')
	// 	.attr("transform", "translate(" + 0 + ',' + 0 + ")scale(" + 1 + ")")
	// 	.selectAll('path')
	// 		.on('click', function(d) { 
	// 			var bbox = this.getBBox(),
	// 			centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2],
	//             zoomScaleFactor = 500 / bbox.width,
	//             zoomX = -centroid[0],
	//             zoomY = -centroid[1];

	//             console.log(bbox.width)

	//             // set a transform on the parent group element
	// 	        map.svg.selectAll('g')
	// 	            .attr("transform", "scale(" + zoomScaleFactor + ")" +
	// 	                "translate(" + zoomX + "," + zoomY + ")");
	// 		});

	// Get the centroid location of a country
	map.svg.selectAll('.datamaps-subunit').on('click', function(d) {
		var centroid = map.path.centroid(d),
		zoomScaleFactor = 300 / this.getBBox().width,

		// 500, 300 placeholders for svg dimensions
		zoomX = -centroid[0] + zoomOffset(500, zoomScaleFactor),
		zoomY = -centroid[1] + zoomOffset(300, zoomScaleFactor);

		// set a transform on the parent group element
		map.svg.selectAll('g')
		    .attr("transform", "scale(" + zoomScaleFactor + ")" + "translate(" + (zoomX) + "," + (zoomY) + ")");

		function zoomOffset(dimension, zoom) {
			return (dimension / zoom) / 2;
		};
	});

	//  map.svg.call(d3.behavior.zoom().on("zoom", redraw));

	//  function redraw() {
	//       map.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	//  };

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
		update(bubble.circuitId);
	});
};

/*
* Placeholder for all update functions
*/
function update(circuitId) {

	var race_data = races[circuitId]['data'];

	// check is graph has been created
	if (d3.selectAll('#lineGraph').select('g').empty() == true) {

		// graph has not been created
		makeLineGraph(race_data);
		makePieChart();
	}
	else {

		// graph has been created
		updateLineGraph(race_data);
	};

	
};

/*
* Draw the line graph
*/
function makeLineGraph(data) {

	var svg = d3.select("#lineGraph"),
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width =+ svg.attr("width") - margin.left - margin.right,
	height =+ svg.attr("height") - margin.top - margin.bottom,
	g = svg.append("g")
		.attr('class', 't')
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// set domains
	var xDomain = d3.extent(data, function(d) { return d.season; })
	var yDomain = d3.extent(data, function(d) { return d.time; });

	// set scales
	var xScale = d3.scale.linear().range([0, width]).domain(xDomain);
	var yScale = d3.scale.linear().range([height, 0]).domain(yDomain);

	// set axes
	var xAxis = d3.svg.axis().scale(xScale).orient('bottom')

		// format year to exclude , delimiter
		.tickFormat(d3.format("d"));
	var yAxis = d3.svg.axis().scale(yScale).orient('left');

	// set line function
	var line = d3.svg.line()
		.x(function(d) { return xScale(d.season); })
		.y(function(d) { return yScale(d.time); });

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

	g.append('path')
		.attr('class', 'line')
		.attr('d', line(data));
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
		.enter()
		.append("g")
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

function updateLineGraph(data) {

};