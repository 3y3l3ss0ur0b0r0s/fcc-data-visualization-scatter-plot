// API URL
const api_url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const allegationDotClr = "rgba(0,123,99, 0.6)";
const aEmphasisDotClr = "#00493b";
const noAllegationDotClr = "rgba(242,196,56, 0.6)";
const nEmphasisDotClr = "#f2a533";

// GET DATA FROM API BY DEFINING ASYNC FUNCTION
async function getAPI(url) {
  // STORING RESPONSE
  const response = await fetch(url);

  // STORING DATA IN THE FORM OF JSON
  var data = await response.json();
  console.log(data);
  renderData(data);
}

function renderData(data) {
  console.log("In renderData(data).");

  // CREATE OUR VARIABLES
  const dataset = data;
  console.log(typeof dataset);
  
  const w = 600;
  const h = 400;

  // MAKE SCALES
  const padding = 60;
  
  // SCALING LINEAR BECAUSE WE'RE JUST WORKING WITH DATES ON THE X-AXIS
  const xScale = d3.scaleLinear()
    .domain([d3.min(dataset, (d) => d["Year"]-1), d3.max(dataset, (d) => d["Year"])+1])
    .range([padding, w-padding]);
  
  // SCALING TIME BECAUSE WE'RE GONNA USE "TIME" ON THE Y-AXIS
    // CREATE A PARSER FOR THE TIME
  
  const myFormat = "%M:%S";
  const formattedData = dataset.map((d) => d3.timeParse(myFormat)(d["Time"]));
  
  const slowestTime = d3.max(dataset.map((d) => d["Seconds"])) + 5;
    let seconds = slowestTime % 60;
    let secondsZero = seconds > 9 ? "" : "0";
    let minutes = Math.floor(slowestTime/60);
    const yMinimum = d3.timeParse(myFormat)(minutes + ":" + secondsZero + seconds);
  
  const fastestTime = d3.min(dataset.map((d) => d["Seconds"])) - 5;
    seconds = fastestTime % 60;
    secondsZero = seconds > 9 ? "" : "0";
    minutes = Math.floor(fastestTime/60);
    const yMaximum = d3.timeParse(myFormat)(minutes + ":" + secondsZero + seconds);
  
    // CREATING YSCALE; INVERTED SO FASTER TIMES ARE HIGHER ON THE AXIS
  const yScale = d3.scaleTime()
    .domain([yMinimum, yMaximum])
    .range([h-padding, padding]);
  
  // CREATE SVG
  const svg = d3.select("#graphics-box")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  
  // ADD TITLE
  d3.select("svg")
    .append("text")
    .text("Doping Among Fastest Times in Professional Cycling")
    .attr("x", w/4)
    .attr("y", padding-20);
  
  // CREATE TOOLTIPS
  d3.select("#overlay")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute");
  
  // ADD DATA POINTS
  svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("svg")
    .append("circle")
    .style("fill", function(d) {
    return d["URL"] === "" ? noAllegationDotClr : allegationDotClr;
  })
    .attr("class", "dot")
    .on("mouseover", function(e, d) {     
        d3.select(this)
          .style("fill", function(d) {
          return d["URL"] === "" ? nEmphasisDotClr : aEmphasisDotClr;
        });
        
        let firstNumber = d["Place"].toString().substring(0,1);
        let secondNumber = d["Place"].toString().substring(1,2);
    
        let suffix = (firstNumber == '1' && d["Place"] < 10 ) || secondNumber == '1' ? "st" : ((d["Place"] === 2 || secondNumber == '2') ? "nd" : (d["Place"] === 3 || (secondNumber == '3' && d["Place"] != 13) ? "rd" : "th"));
    
        const[x, y] = d3.pointer(e);
    
        d3.select("#tooltip")
          .attr("data-year", d["Year"])
          .style("visibility", "visible")
          .style("left", (e.pageX) + "px")
          .style("top", (e.pageY) + "px")
          .text(d["Name"] + " (" + d["Nationality"] + ", " + d["Place"] + suffix + " place, "+ d["Time"] + ") " + d["Doping"]);
    })
    .on("mouseout", function() {
        //console.log("Moused out!");
    
        d3.select("#tooltip")
          .style("visibility","hidden");
    
        d3.select(this)
          .style("fill", function(d) {
          return d["URL"] === "" ? noAllegationDotClr : allegationDotClr;
      });
    })
    .attr("cx", (d) => xScale(d["Year"]))
    .attr("cy", (d) => yScale(d3.timeParse(myFormat)(d["Time"])))
    .attr("r", 4)
    .attr("data-xvalue", (d) => d["Year"])
    .attr("data-yvalue", (d) => d3.timeParse(myFormat)(d["Time"]));

  // MAKE AXES
  const xAxis = d3.axisBottom(xScale)
    .tickFormat((d) => parseInt(d.toString().replace(/,/g, '')));
  
    // YAXIS TICKS FORMATTED TO USE THE PARSED TIME
  const yAxis = d3.axisLeft(yScale)
    .tickFormat((d) => d3.timeFormat(myFormat)(d));
  
  // APPEND AXES
  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + (h-padding ) + ")")
    .call(xAxis);
  
  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + (padding) + ",0)")
    .call(yAxis);
  
  // CREATE LEGEND
  const legend = d3.select("#graphics-box")
    .append("text")
    .attr("id", "legend")
    .text("Legend")
    .style("font-weight", "bold")
    .attr("width", (w/6))
    .attr("height", (h/6));
    
  d3.select("#legend")
    .append("text")
    .attr("id", "legendLine1")
    .style("color", allegationDotClr)
    .text("• ")
    .append("text")
    .style("color", "#000")
    .style("font-weight", "normal")
    .text(" Has doping allegations");
  
  d3.select("#legend")
    .append("text")
    .attr("id", "legendLine2")
    .style("color", noAllegationDotClr)
    .text("• ")
    .append("text")
    .style("color", "#000")
    .style("font-weight", "normal")
    .text(" Has no doping allegations");
}

// CALL GETAPI(API_URL)
getAPI(api_url);
