// load the DOM and d3 second
window.onload = function() {

	d3.queue()
		.defer(d3.json, 'circuits.json')
		.await(mainFunction);
};

/*
* Main Function
*/
function mainFunction(error, data2016, data1963) {

	if (error) throw error;

	console.log('Test');
};