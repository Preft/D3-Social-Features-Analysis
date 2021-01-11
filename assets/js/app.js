//Declar Vars & Chart Size
var svgWidth = 960;
var svgHeight = 500;
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
var svg = d3.select("#scatter").append("svg").attr("width", svgWidth).attr("height", svgHeight);
var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// Define functions for chart
xScale=(data, chosenXAxis)=> {
  var xLinearScale = d3.scaleLinear().domain([d3.min(data, d => d[chosenXAxis]*.9), d3.max(data, d => d[chosenXAxis]) * 1.1]).range([0, width]);
  return xLinearScale;
}

yScale=(data, chosenYAxis)=> {
    var yLinearScale = d3.scaleLinear().domain([d3.min(data, d => d[chosenYAxis]*.9), d3.max(data, d => d[chosenYAxis])* 1.1]).range([height, 0]);
    return yLinearScale;
  }

generateVerticalAxes=(newXScale, xAxis)=> {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition().duration(1000).call(bottomAxis);
  return xAxis;
}

generateHorizontalAxes=(newYScale, yAxis)=> {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition().duration(1000).call(leftAxis);
    return yAxis;
  }

generatePoints=(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis)=> {
  circlesGroup.transition().duration(1000).attr("cx", d => newXScale(d[chosenXAxis])).attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}
generateTextPoints=(textsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis)=> {
    textsGroup.transition().duration(1000).attr("x", d => newXScale(d[chosenXAxis])).attr("y", d => newYScale(d[chosenYAxis]-.2));
    return textsGroup;
  }
// Tool Chart
updateToolTip=(chosenXAxis, chosenYAxis, circles)=> {
    var label;

    if (chosenXAxis === "poverty") {
        label = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        label = "Age:";
    } else if (chosenXAxis === "income") {
        label = "Income:";
    }

    if (chosenYAxis === "obesity") {
        ylabel = "Obesity:";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smokes:";
    } else if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare:";
    }

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

    circles.call(toolTip);
    circles.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data, this);
    });

  return circles;
}

// Get Data
d3.csv("./assets/data/data.csv").then(function(data, err) {
    if (err) throw err;
    data.forEach(function(data) {
        data.abbr = String(data.abbr);
        data.poverty = Number(data.poverty);
        data.age = Number(data.age);
        data.income = Number(data.income);
        data.healthcare = Number(data.healthcare);
        data.obesity = Number(data.obesity);
        data.smokes = Number(data.smokes);

    });

    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    var xAxis = chartGroup.append("g").classed("x-axis", true).attr("transform", `translate(0, ${height})`).call(bottomAxis);
    var yAxis = chartGroup.append("g").classed("y-axis", true).attr("transform", `translate(0, 0)`).call(leftAxis);

    var circles = chartGroup.selectAll().data(data).enter().append("g");

    var circlesGroup = circles.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 14)
    .attr("fill", "blue")
    .attr("opacity", ".2");
    
    var textsGroup = circles.append("text").text(d=>d.abbr).attr("x", d => xLinearScale(d[chosenXAxis])).attr("y", d => yLinearScale(d[chosenYAxis]-.2)).style("font-size", "12px").style("text-anchor", "middle");


    var xlabelsGroup = chartGroup.append("g").attr("transform", `translate(${width / 2}, ${height + 20})`);
    var ylabelsGroup = chartGroup.append("g").attr("transform", `rotate(-90) translate(${-(height/2)}, ${-20})`);

    var PovertyLabel = xlabelsGroup.append("text").attr("x", 0).attr("y", 20).attr("value", "poverty").classed("active", true).text("In Poverty (%)");
    var AgeLabel = xlabelsGroup.append("text").attr("x", 0).attr("y", 40).attr("value", "age").classed("inactive", true).text("Age (Median)");
    var IncomeLabel = xlabelsGroup.append("text").attr("x", 0).attr("y", 60).attr("value", "income").classed("inactive", true).text("Household Income (Median)");

    var ObesityLabel = ylabelsGroup.append("text").attr("x", 0).attr("y", -20).attr("value", "obesity").classed("active", true).text("Obese (%)");
    var SmokesLabel = ylabelsGroup.append("text").attr("x", 0).attr("y", -40).attr("value", "smokes").classed("inactive", true).text("Smokes (%)");
    var HealthcareLabel = ylabelsGroup.append("text").attr("x", 0).attr("y", -60).attr("value", "healthcare").classed("inactive", true).text("Lacks Healthcare");

    var circles = updateToolTip(chosenXAxis, chosenYAxis, circles);

    // x axist event listener
    xlabelsGroup.selectAll("text").on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            chosenXAxis = value;
            xLinearScale = xScale(data, chosenXAxis);
            xAxis = generateVerticalAxes(xLinearScale, xAxis);
            circlesGroup = generatePoints(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            textsGroup = generateTextPoints(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            circles = updateToolTip(chosenXAxis, chosenYAxis, circles);

            if (chosenXAxis === "poverty") {
                PovertyLabel.classed("active", true).classed("inactive", false);
                AgeLabel.classed("active", false).classed("inactive", true);
                IncomeLabel.classed("active", false).classed("inactive", true);
            } else if (chosenXAxis === "age") {
                PovertyLabel.classed("active", false).classed("inactive", true);
                AgeLabel.classed("active", true).classed("inactive", false);
                IncomeLabel.classed("active", false).classed("inactive", true);
            } else if (chosenXAxis === "income") {
                PovertyLabel.classed("active", false).classed("inactive", true);
                AgeLabel.classed("active", false).classed("inactive", true);
                IncomeLabel.classed("active", true).classed("inactive", false);
            } else {
                PovertyLabel.classed("active", true).classed("inactive", false);
                AgeLabel.classed("active", false).classed("inactive", true);
                IncomeLabel.classed("active", false).classed("inactive", true);
            }
      }
    }); 
    // y axist event listener
    ylabelsGroup.selectAll("text").on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            chosenYAxis = value;
            yLinearScale = yScale(data, chosenYAxis);
            yAxis = generateHorizontalAxes(yLinearScale, yAxis);
            circlesGroup = generatePoints(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            textsGroup = generateTextPoints(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            circles = updateToolTip(chosenXAxis, chosenYAxis, circles);

        // changes classes to change bold text
            if (chosenYAxis === "obesity") {
                ObesityLabel.classed("active", true).classed("inactive", false);
                SmokesLabel.classed("active", false).classed("inactive", true);
                HealthcareLabel.classed("active", false).classed("inactive", true);
            } else if (chosenYAxis === "smokes") {
                ObesityLabel.classed("active", false).classed("inactive", true);
                SmokesLabel.classed("active", true).classed("inactive", false);
                HealthcareLabel.classed("active", false).classed("inactive", true);
            } else if (chosenYAxis === "healthcare") {
                ObesityLabel.classed("active", false).classed("inactive", true);
                SmokesLabel.classed("active", false).classed("inactive", true);
                HealthcareLabel.classed("active", true).classed("inactive", false);
            } else {
                ObesityLabel.classed("obesity", true).classed("inactive", false);
                SmokesLabel.classed("active", false).classed("inactive", true);
                HealthcareLabel.classed("active", false).classed("inactive", true);
            }
      }
    }); 
}).catch(function(error) {
  console.log(error);
});
