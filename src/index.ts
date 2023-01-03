import * as d3 from "d3"
import { getData } from "./data"
import { Const } from "./constants"


function timeParse(minSec: string) {
    const [min, sec] = minSec.split(":");
    const date = new Date();
    date.setMinutes(parseInt(min));
    date.setSeconds(parseInt(sec));

    return date;
}

function timeFormat(date: Date) {
    let min = date.getMinutes().toString();
    let sec = date.getSeconds().toString();

    while (min.length < 2)
        min = '0' + min;
    while (sec.length < 2)
        sec = '0' + sec;

    return min + ":" + sec;
}

// ----- Main program -----

function main() {

    // Get data
    const data = getData(Const.ProjectURL);

    // Get app
    const app = d3.select(Const.AppSelector);

    const graph = app.append("div")
        .attr("class", "graph");

    // Create svg
    const svg = graph.append("svg")
        .attr("width", Const.AppWidth)
        .attr("height", Const.AppHeight);
    

    // Create scales
    // x-scale
    let [yearLow, yearHigh] = d3.extent(data, d => d.Year);
    yearLow -= 1; // expand domain for graph padding
    yearHigh += 1;

    const xScale = d3.scaleLinear()
        .domain([yearLow, yearHigh])
        .range([Const.XPadding, Const.AppWidth-Const.XPadding]);

    // y-scale
    const [timeLow, timeHigh] = d3.extent(data, d => timeParse(d.Time));
    const yScale = d3.scaleTime()
        .domain([timeHigh, timeLow]) // lower times are better
        .range([Const.AppHeight-Const.YPadding, Const.YPadding]);
    

    // Create circles
    const circs = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.Year))
            .attr("cy", d => yScale(timeParse(d.Time)))
            .attr("r", Const.PointRadius)
            .attr("fill", d => d.Doping.length > 0 ?
                Const.DopingColor : Const.NonDopingColor)
            .attr("data-xvalue", d => d.Year)
            .attr("data-yvalue", d => timeParse(d.Time) as any)

    // Create axes
    const axisLeft = d3.axisLeft(yScale)
        .tickFormat(d => timeFormat(d as Date));

    const axisBottom = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"));
        
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${yScale(timeHigh)})`)
        .call(axisBottom)
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${xScale(yearLow)}, 0)`)
        .call(axisLeft)

    // Create legend
    const legend = graph.append("div")
        .attr("id", "legend")
        .attr("class", "legend");
    // no doping allegations
    legend.append("p")
        .attr("class", "legend-entry")
        .text("No doping allegations")
        .append("div")
            .attr("class", "legend-square")
            .style("background-color", Const.NonDopingColor);
    // doping allegations
    legend.append("p")
        .attr("class", "legend-entry")
        .text("Riders with doping allegations")
        .append("div")
            .attr("class", "legend-square")
            .style("background-color", Const.DopingColor);

    
    // Create tooltip
    const tooltip = app.append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip")
        .attr("data-year", 0);
    
    tooltip.append("p")
        .attr("class", "name-country");
    tooltip.append("p")
        .attr("class", "year-time");
    tooltip.append("p")
        .attr("class", "allegation");
    
    // Add tooltip callbacks to circles
    circs
        .on("mouseenter", function(evt: MouseEvent, d) {
            const tooltipX = parseFloat(this.attributes.getNamedItem("cx").value) + this.parentElement.getBoundingClientRect().x;
            const tooltipY = parseFloat(this.attributes.getNamedItem("cy").value) + this.parentElement.getBoundingClientRect().y;

            tooltip
                .style("left", tooltipX + 16 + "px")
                .style("top", tooltipY - tooltip.node().getBoundingClientRect().height/2 + "px")
                .style("visibility", "visible")
                .attr("data-year", d.Year);
            tooltip.select(".name-country")
                .text(d.Name + ": " + d.Nationality);
            tooltip.select(".year-time")
                .text("Year: " + d.Year + ", Time: " + d.Time);
            tooltip.select(".allegation")
                .text(d.Doping);
        })
        .on("mouseleave", function(evt: MouseEvent, d) {
            tooltip
                .style("visibility", "hidden");
        });
}

main();
