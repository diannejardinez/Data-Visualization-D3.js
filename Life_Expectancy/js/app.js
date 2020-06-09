
// Setting margin
var margin = { left:80, right:20, top:50, bottom:100 };

var width = 900 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;


// Setting svg chart area for chart transformation
var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


// Setting year to 0
var year = 0;

// Declaring variables as global function
var interval;
var filteredData;

// Adding Tooltip for hovering on scatterplot circles
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<strong>Country:</strong> <span style='color:orange'>" + d.country + "</span><br>";
        text += "<strong>Continent:</strong> <span style='color:orange;text-transform:capitalize'>" + d.continent + "</span><br>";
        text += "<strong>Life Expectancy:</strong> <span style='color:orange'>" + d3.format(".2f")(d.life_exp) + "</span><br>";
        text += "<strong>GDP Per Capita:</strong> <span style='color:orange'>" + d3.format("$,.0f")(d.income) + "</span><br>";
        text += "<strong>Population:</strong> <span style='color:orange'>" + d3.format(",.0f")(d.population) + "</span><br>";
        return text;
    });
g.call(tip);


// X Scale
var x = d3.scaleLog()
    .domain([100, 200000])
    .range([0, width])
    .base(10);

// Y Scale
var y = d3.scaleLinear()
    .range([height, 0])
    .domain([0,100]);

// Y scale - Scatter plot circles - area - Continents
var area = d3.scaleLinear()
    .range([25 * Math.PI, 1500 * Math.PI])
    .domain([2000, 1400000000]);

// Color scheme for Continents scattor plot circles
var continentColor = d3.scaleOrdinal(d3.schemeTableau10);

// X Axis
var xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(function(d){ return "$" + d; });
g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")")
    .call(xAxisCall);

// Y Axis
var yAxisCall = d3.axisLeft(y)
    .tickFormat(function(d){ return +d; });
g.append("g")
    .attr("class", "y axis")
    .call(yAxisCall);

      
// Y axis Gridlines
var yGridlines = d3.axisLeft(y)
    .ticks(10)
    .tickSize(-width)
    .tickFormat("")
g.append("g")           
  .attr("class", "grid")
  .call(yGridlines);


// X Label
var xLabel = g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");

// Y Label
var yLabel = g.append("text")
    .attr("y", -60)
    .attr("x", -(height / 2))
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Life Expectancy (Years)");

// Year label
var yearLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 30)
    .attr("font-size", "30px")
    .attr("opacity", "0.5")
    .attr("text-anchor", "middle")
    .text("1800");


// Legend for Continents
var continents = ["europe", "asia", "americas", "africa"];

var legend = g.append("g")
    .attr("transform", "translate(" + (width - 20) + 
        "," + (height - 560) + ")");

continents.forEach(function(continent, i){
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i * 18) + ")");

    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", continentColor(continent));

    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("text-transform", "capitalize")
        .text(continent);
});

// Getting data
d3.json("data/data.json").then(function(data){
    // console.log(data);

    // Clean data
    filteredData = data.map(function(year){
        return year["countries"].filter(function(country){
            var dataAvailable = (country.income && country.life_exp);
            return dataAvailable
        }).map(function(country){
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;            
        })
    });

    // First run of the visualization
    update(filteredData[0]);
})

// In Jquery -  play and pause button
$("#play-button")
    .on("click", function(){
        var button = $(this);
        if (button.text() == "Play"){
            button.text("Pause");
            interval = setInterval(step, 100);            
        }
        else {
            button.text("Play");
            clearInterval(interval);
        }
    })

// In Jquery -  reset button
$("#reset-button")
    .on("click", function(){
        year = 0;
        update(filteredData[0]);
    })

// In Jquery -  continent filter with active changing filter
$("#continent-select")
    .on("change", function(){
        update(filteredData[year]);
    })

function step(){
    // Loops back when data reaches the end
    year = (year < 214) ? year+1 : 0
    update(filteredData[year]);
}


function update(data) {
    // Standard transition year for the visualization
    var t = d3.transition()
        .duration(100);

    // Continent filter for filter dropdown menu
    var continent = $("#continent-select").val();
    var data = data.filter(function(d){
        if (continent == "all") { return true; }
        else {
            return d.continent == continent;
        }
    })

    // JOIN new data with old elements.
    var circles = g.selectAll("circle").data(data, function(d){
        return d.country;
    });

    // EXIT old elements not present in new data.
    circles.exit()
        .attr("class", "exit")
        .remove();

    // ENTER new elements present in new data.
    circles.enter()
        .append("circle")
        .attr("class", "enter")
        .attr("fill", function(d) { return continentColor(d.continent); })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .merge(circles)
        .transition(t)
            .attr("cy", function(d){ return y(d.life_exp); })
            .attr("cx", function(d){ return x(d.income) })
            .attr("r", function(d){ return Math.sqrt(area(d.population) / Math.PI) });

    // Update the year label
    yearLabel.text(+(year + 1800))
}