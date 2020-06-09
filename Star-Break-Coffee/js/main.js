/*
*    Project 1 - Star Break Coffee
*/

// Setting up svg chart area
var margin = { left:100, right:10, top:10, bottom:150 };

var width = 900 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left 
            + ", " + margin.top + ")");

// X Label
g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month");

// Y Label
g.append("text")
    .attr("x", - (height / 2))
    .attr("y", -80)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Revenue");

// X axis
var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")");

// Y axis
var yAxisGroup = g.append("g")
    .attr("class", "y axis");


// X Scale
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

// Y Scale
var y = d3.scaleLinear()
    .range([height, 0]);


// Switching between Revenue and Profit
var flag = true;

// Switching transition time
var time = d3.transition().duration(750);


d3.json("data/revenues.json").then(function(data){
    console.log(data);

    // Cleaning data from string to integer
    data.forEach(function(d) {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    // Slicing data that switchs from profit and revenue
    // with Revenue showing dataset for January
    // with Profit not showing dataset for January 
    d3.interval(function(){
        var newData = flag ? data : data.slice(1);

        update(newData)
        flag = !flag
    }, 1000);

    // Run the vis for the first time
    update(data);
});

function update(data) {
    // declaring value variable and using turn around operator
    // if true - revenue on the left will be returned
    // if false - profit on the right will be returned
    var value = flag ? "revenue" : "profit";

    // X Scale
    var x = d3.scaleBand()
        .domain(data.map(function(d){ return d.month }))
        .range([0, width])
        .padding(0.2);

    // Y Scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.revenue })])
        .range([height, 0]);

    // X Axis
    var xAxisCall = d3.axisBottom(x);
    xAxisGroup.transition(time).call(xAxisCall);;

    // Y Axis
    var yAxisCall = d3.axisLeft(y)
        .tickFormat(function(d){ return "$" + d; });
    yAxisGroup.transition(time).call(yAxisCall);

    // Bars
    // JOIN new data with old elements.
    var rects = g.selectAll("rect")
        .data(data, function(d){
            return d.month;
        });

    // EXIT old elements not present in new data.
    rects.exit()
        .attr("fill", "green")
    .transition(t)
        .attr("y", y(0))
        .attr("height", 0)
        .remove();


    // ENTER new elements present in new data...
    rects.enter()
        .append("rect")
            .attr("x", function(d){ return x(d.month); })
            .attr("y", y(0))
            .attr("width", x.bandwidth)
            .attr("height", 0)
            .attr("fill", "grey")
            // AND UPDATE old elements present in new data.
            .merge(rects)
            .transition(time)
                .attr("x", function(d){ return x(d.month) })
                .attr("y", function(d){ return y(d[value]); })
                .attr("width", x.bandwidth)
                .attr("height", function(d){ return height - y(d[value]); });
    
    // Set y- label for flag
    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);
}

