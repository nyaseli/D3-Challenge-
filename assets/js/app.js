var chart = d3.select("#scatter").append("div").classed("chart", true); 
var widthPage = 960;
var heightPage = 620;
var padding = {
    top:20, 
    bottom:220, 
    Left:80,
    Right:20
};
var width = widthPage - padding.Left - padding.Right;
var height = heightPage - padding.top - padding.bottom;
var xaxisname = "poverty";
var yaxisname = "healthcare";

var plot = chart.append("svg").attr("width",widthPage).attr("height",heightPage);
var graph = plot.append("g").attr("transform",`translate(${padding.Left},${padding.Right})`);

function scaleXaxis(data, xaxisname){
    var axis = d3.scaleLinear().domain([d3.min(data, name => name[xaxisname]), 
                d3.max(data, name => name[xaxisname])]).range([0,width]);
    return axis;
}

function scaleYaxis(data, yaxisname){
    var axis = d3.scaleLinear().domain([d3.min(data, name => name[yaxisname]), 
                d3.max(data, name => name[yaxisname])]).range([height,0]);
    return axis;
}

function styleXaxis(value, xaxisname){
    if (xaxisname === "poverty"){
        return `${value}%`;
    }
    else {
        return `${value}`;
    }
}

function updateLabels(xaxisname, yaxisname, circlegroups){
    var xaxislabel = "";
    var yaxislabel = "";
    if (xaxisname === "poverty"){
        xaxislabel = "In Poverty (%)" 
    }
    else if (xaxisname === "age"){
        xaxislabel = "Age (Median)"
    }
    else if (xaxisname === "income"){
        xaxislabel = "Household Income (Median)"
    }
    if (yaxisname === "obesity"){
        yaxislabel = "Obese (%)" 
    }
    else if (yaxisname === "smokes"){
        yaxislabel = "Smokes (%)"
    }
    else if (yaxisname === "healthcare"){
        yaxislabel = "Lacks Healthcare (%)"
    }
    var tooltip = d3.tip().attr("class", "d3-tip").html(function(val){
        return (`${val.state}<br/>${xaxislabel} ${styleXaxis(val[xaxisname], xaxisname)} <br/>${yaxislabel} ${val[yaxisname]}%`)
    });
    circlegroups.call(tooltip);
    circlegroups.on("mouseover", tooltip.show).on("mouseout", tooltip.hide);
    return circlegroups;
}

function renderXaxis(newscale, oldscale){
    var haxis = d3.axisBottom(newscale);
    oldscale.transition().duration(500).call(haxis);
    return oldscale;
}

function renderYaxis(newscale, oldscale){
    var vaxis = d3.axisLeft(newscale);
    oldscale.transition().duration(500).call(vaxis);
    return oldscale;
}

function renderText(tgroup, newXscale, oldXscale, newYscale, oldYscale){
    tgroup.transition().duration(500).attr("x", val => newXscale(val[oldXscale])).attr("y", val => newYscale(val[oldYscale]));
    return tgroup;
}

function renderCircles(cgroup, newXscale, oldXscale, newYscale, oldYscale){
    cgroup.transition().duration(500).attr("cx", val => newXscale(val[oldXscale])).attr("cy", val => newYscale(val[oldYscale]));
    return cgroup;
}


d3.csv("./assets/data/data.csv").then(function(dataset){
    dataset.forEach(function(table){
        table.obesity = +table.obesity;
        table.income = +table.income;
        table.healthcare = +table.healthcare;
        table.age = +table.age;
        table.poverty = +table.poverty;
        table.smokes = +table.smokes;
    });
    var scaleofx = scaleXaxis(dataset, xaxisname);
    var scaleofy = scaleYaxis(dataset, yaxisname);
    var haxis = d3.axisBottom(scaleofx);
    var vaxis = d3.axisLeft(scaleofy);

    var xaxis = graph.append("g").classed("x-axis", true).attr("transform", `translate(0,${height})`).call(haxis);
    var yaxis = graph.append("g").classed("y-axis", true).call(vaxis);
    var circlegroups = graph.selectAll("circle").data(dataset).enter().append("circle").classed("stateCircle", true)
                        .attr("cx", value => scaleofx(value[xaxisname])).attr("cy", value => scaleofy(value[yaxisname]))
                        .attr("r", 12).attr("opacity", "0.5");
    var tgroups = graph.selectAll(".stateText").data(dataset).enter().append("text").classed("stateText", true)
                        .attr("x", value => scaleofx(value[xaxisname])).attr("y", value => scaleofy(value[yaxisname]))
                        .attr("dy", 3).attr("font-size", "10px").text(function(val) {return val.abbr});
    var xlabels = graph.append("g").attr("transform", `translate(${width/2}, ${height+10+padding.top})`);
    var ylabels = graph.append("g").attr("transform", `translate(${0-padding.Left/4}, ${height/2})`);

    var povertyLabel = xlabels.append("text").classed("aText", true).classed("active", true)
                        .attr("x", 0).attr("y", 20).attr("value", "poverty").text("In Poverty (%)"); 
    var ageLabel = xlabels.append("text").classed("aText", true).classed("inactive", true)
                        .attr("x", 0).attr("y", 40).attr("value", "age").text("Age (Median)");   
    var incomeLabel = xlabels.append("text").classed("aText", true).classed("inactive", true)
                        .attr("x", 0).attr("y", 60).attr("value", "income").text("Household Income (Median)");
    

    var healthcareLabel = ylabels.append("text").classed("aText", true).classed("active", true)
                        .attr("x", 0).attr("y", 0-20).attr("dy", "1em").attr("transform", "rotate(-90)").attr("value", "healthcare").text("Lacks Healthcare (%)"); 
    var smokesLabel = ylabels.append("text").classed("aText", true).classed("inactive", true)
                        .attr("x", 0).attr("y", 0-40).attr("dy", "1em").attr("transform", "rotate(-90)").attr("value", "smokes").text("Smokes (%)");   
    var obeseLabel = ylabels.append("text").classed("aText", true).classed("inactive", true)
                        .attr("x", 0).attr("y", 0-60).attr("dy", "1em").attr("transform", "rotate(-90)").attr("value", "obesity").text("Obese (%)");

                                  
    var circlegroups = updateLabels(xaxisname, yaxisname, circlegroups);
    xlabels.selectAll("text").on("click", function(){
    var value = d3.select(this).attr("value");
    if (value != xaxisname){
        xaxisname = value;
        scaleofx = scaleXaxis(dataset, xaxisname);
        xaxis = renderXaxis(scaleofx, xaxis);
        circlegroups = renderCircles(circlegroups, scaleofx, xaxisname, scaleofy, yaxisname);
        tgroups = renderText(tgroups,scaleofx, xaxisname, scaleofy, yaxisname); 
        circlegroups = updateLabels(xaxisname, yaxisname, circlegroups);

        if (xaxisname === "poverty"){
            povertyLabel.classed("active", true).classed("inactive", false);
            ageLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", false).classed("inactive", true);
        }
        else if (xaxisname === "age"){
            ageLabel.classed("active", true).classed("inactive", false);
            povertyLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", false).classed("inactive", true);
        }
        else if (xaxisname === "income"){
            incomeLabel.classed("active", true).classed("inactive", false);
            povertyLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", false).classed("inactive", true);
        }
    }
    });


    ylabels.selectAll("text").on("click", function(){
        var value = d3.select(this).attr("value");
        if (value != yaxisname){
            yaxisname = value;
            scaleofy = scaleYaxis(dataset, yaxisname);
            yaxis = renderYaxis(scaleofy, yaxis);
            circlegroups = renderCircles(circlegroups, scaleofx, xaxisname, scaleofy, yaxisname);
            tgroups = renderText(tgroups,scaleofx, xaxisname, scaleofy, yaxisname); 
            circlegroups = updateLabels(xaxisname, yaxisname, circlegroups);
    
            if (yaxisname === "healthcare"){
                healthcareLabel.classed("active", true).classed("inactive", false);
                smokesLabel.classed("active", false).classed("inactive", true);
                obeseLabel.classed("active", false).classed("inactive", true);
            }
            else if (yaxisname === "smokes"){
                smokesLabel.classed("active", true).classed("inactive", false);
                healthcareLabel.classed("active", false).classed("inactive", true);
                obeseLabel.classed("active", false).classed("inactive", true);
            }
            else if (yaxisname === "obesity"){
                obeseLabel.classed("active", true).classed("inactive", false);
                healthcareLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", false).classed("inactive", true);
            }
        }
        });

});
