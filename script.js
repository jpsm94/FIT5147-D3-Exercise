/*
script.js
*/

// set margins and measures
var margin = {left: 100, right: 100, top: 100, bottom: 100 };

var width = 1000 - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;

var max = 0;

var xNudge = 100;
var yNudge = 30;


// function for parsing date from data
var parseDate = d3.timeParse("%b %d %Y");		// mon(abbrev) day year(4 digits)

// min and max dates which represents one calendar year
var minDate = new Date(2017,0,1);
var maxDate = new Date(2017,11,31);


// set scales
var y = d3.scaleLinear()
			.domain([0,max])
			.range([height,0]);

var x = d3.scaleTime()
			.domain([minDate,maxDate])
			.range([0,width]);


// x and y axes
var xAxis = d3.axisBottom(x)
	.ticks(d3.timeMonth)
	.tickFormat(d3.timeFormat("%B"));		// month name
	
var yAxis = d3.axisLeft(y);	
	

// use month and mm as x and y values for the line points
var line = d3.line()
	.x(function(d) { return x(d.month); })
	.y(function(d) { return y(d.mm); })
	.curve(d3.curveCardinal);
		

// create the chart on the placeholder tag		
var svg = d3.select("#d3Chart")
	.append("svg")
	.attr("id","svg")
	.attr("height","100%")
	.attr("width","100%");
	
var chartGroup = svg
	.append("g")
	.attr("class","chartGroup")
	.attr("transform","translate("+xNudge+","+yNudge+")");		


// Axis labels
chartGroup.append("text")
	.attr("class", "axis-label")
	.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
	.attr("transform", "translate("+ (width/2) +","+(height+yNudge*1.5)+")")  // centre below axis
	.text("Month");
	
chartGroup.append("text")
	.attr("class", "axis-label")
	.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
	.attr("transform", "translate("+ (-xNudge/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
	.text("Average Rainfall in Millimeters");


// Tooltip functions
function showTooltip(obj, d) {
	var coord = d3.mouse(obj);
	var tooltip = d3.select("#tooltip");
	//console.log("showTooltip: " + d.city + "," + d.days + "," + d.mm + ", coord:" + coord);
	// position the tooltip
	tooltip.style("left", (coord[0] + xNudge + 14) + "px" );
	tooltip.style("top", (coord[1] - yNudge*4) + "px");
	$("#tooltip").html("City: <strong>" + d.city + "</strong><br/>Avg Rainfall: <strong>" + d.mm + " mm</strong><br/>Avg # Rainy days: <strong>" + d.days + "</strong>");
	$("#tooltip").show();
}

function hideTooltip() {
	//console.log("hideTooltip");
	$("#tooltip").html("");
    $("#tooltip").hide();
}
	

// load data from CSV	
d3.csv("task3data.csv", function(error, data) {

	data.forEach(function(d) {		// formatting of data
		d.month = parseDate(d.month + " 1 2017");
		d.days = Number(d.days);
		d.mm = Number(d.mm);
		//console.log("row: " + d.city + "," + d.month + "," + d.days + "," + d.mm);
    });
	
	// update scale range for y axis
    y.domain([0, d3.max(data, function(d) { return d.mm; }) + 40]);
	
	 // Nest the entries by city
    var dataNest = d3.nest()
        .key(function(d) {return d.city;})
        .entries(data);
		
	// set color  scale
	var color = d3.scaleOrdinal(d3.schemeCategory10); 
	
	 var linesGroup = chartGroup.append("g")
		.attr("class","lines");
		
	 // Loop through each city
    dataNest.forEach(function(d, i) {
		//console.log("loop city: " + d.key);
        linesGroup.append("path")
            .attr("class", "line")
            .style("stroke", function() { 	
                return d.color = color(d.key); })
            .attr("d", line(d.values));
			
        // for the Legend for each city
        linesGroup.append("text")
            .attr("x", width - 20)
            .attr("y", 50 + i*yNudge)
            .attr("class", "legend")   
            .style("fill", function() { 
                return d.color = color(d.key); })
            .text(d.key);				
    });
	
	// Legend header
	linesGroup.append("text")
		.attr("x", width - 20)
		.attr("y", 10)
		.attr("class", "legend legend-header") 
		.text("Legend");				
	
	var pointsGroup = chartGroup.append("g")
		.attr("class","points");

	// points
	pointsGroup
		.selectAll("circle")
		.data(data)
		.enter().append("circle")
		.attr("fill", function(d) { return color(d.city); })
		.attr("r", 5)
		.attr("cx", function(d,i) { return x(d.month); })
		.attr("cy", function(d,i) { return y(d.mm); })
		.on("mouseover", function(d) {
			showTooltip(this, d);
			//console.log("mouseover: " + d.days);
        })
        .on("mouseout", function() {
			hideTooltip();
			//console.log("mouseout");
        });
	
	// X Axis
	chartGroup.append("g")
		.attr("class","axis x")
		.attr("transform","translate(0,"+height+")")
		.call(xAxis);

	// Y Axis
	chartGroup.append("g")
		.attr("class","axis y")
		.call(yAxis);	
});