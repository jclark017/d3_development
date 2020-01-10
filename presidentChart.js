function generatePresidentChart()
{

  // Set margins for main chart
  var margin = {top: 20, right: 20, bottom: 90, left: 30},
      width = 400 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom,
      chartHeight = 400,
      iPres = 0

  
  //President x axis
    //Get data
  d3.json("presidents.json", function(errorPres, presData) {
    var xPres = d3.scale.ordinal()
        .domain(presData.map(function (d) { return d.Name; }))
        .rangeRoundBands([0, width], .1);

    var yAxisScale = d3.scale.linear().domain([250, -150]).range([0, height]);
    var yAxisLeft = d3.svg.axis().scale(yAxisScale).ticks(16).orient("left");

    var xAxisPres = d3.svg.axis()
            .scale(xPres)
            .orient("bottom");

    // create the SVG
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "svg1")
      .append("g")
        .attr("class", "graph1")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //paint the y axis
    svg.append("g")
        .attr("class", "y axis axisLeft")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxisLeft)
        .append("text")
        .attr("y", -10)
        .attr("x",0 - (height / 2))
        .style("text-anchor", "middle")
        .style("font-size","14px")
        .attr("transform", "rotate(-90)")
        .attr("dy", "-2em")
        .text("Average Annual Change in Deficit(Surplus)");

    // paint the x axis for presidents
    let xAxisPresPaint = svg.append("g")
        .attr("class", "xPres axis")
        .attr("transform", "translate(" + margin.left +","+ (height + margin.bottom) + ")")
        .call(xAxisPres)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 50)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .attr("dy", ".35em");

    // Paint President bars
    iPres = 0
    barsPres = svg.selectAll(".barPresident").data(presData).enter();
    barsPres.append("rect")
          .attr("class", function(d) { 
              return "barPresident " + d.party; 
            })
          .attr("x", function(d, i) {return xPres(d.Name)+margin.left;})
          .attr("y", function(d) {return yAxisScale(0)}) //animated later
          .attr("width", function(d) {return xPres.rangeBand();})
          .attr("height",0) //animated later
          .attr("id",function(d,i) {return trimPresidentName(xPres.domain()[i]);})


    // fetch Budget data to paint bars
    d3.csv("budget.csv", function(error, dataProto) {
      //Convert data formats
      var data = dataProto.map(
        function (currentObject) {
          return {
            Year: currentObject.Year,
            Net: parseFloat(-currentObject.Net),
            Preceding_Net: parseFloat(currentObject.Preceding_Net),
            ChangeFromPreceding_Net: parseFloat(currentObject.ChangeFromPreceding_Net),
            Change_Net: parseFloat(currentObject.Change_Net),
            TotalDebt: parseFloat(currentObject.TotalDebt),
            PresidentParty: currentObject.PresidentParty,
            SenateMajorityParty: currentObject.SenateMajorityParty,
            HouseMajorityParty: currentObject.HouseMajorityParty,
            President: trimPresidentName(currentObject.President),
            SuperMajority: currentObject.SuperMajority
          };
        }
      );    

    console.log(data);
    //TODO Next. Use the below samples as a guide to paint the bars for president incrementally as the 
    // years go by. Write functions to traverse the object and sum things up.

    function calcPresScale(presName) {
      return yAxisScale(d3.sum(
          data.filter(d => trimPresidentName(d.President) === presName),
                d => d.ChangeFromPreceding_Net)
        /
        d3.count(
          data.filter(d => trimPresidentName(d.President) === presName),
                d => d.ChangeFromPreceding_Net)
    )
    };
    console.log(
     //yAxisScale(0)
      calcPresScale(trimPresidentName("BillClinton"))
    )


    //Animation for Presidents
    svg.selectAll("rect.barPresident")
    .transition()
    .duration(500) 
    .attr("y", function(dy, i) {      
        return Math.min(yAxisScale(0),calcPresScale(trimPresidentName(xPres.domain()[i])));
      })
    .attr("height", function(d, i) {return Math.abs(yAxisScale(0) - calcPresScale(trimPresidentName(xPres.domain()[i])))}) 
    .delay(function(d,i){ return(i*100)});

    //Animation for rectangles
    svg.selectAll("rect.bar1, rect.bar2")
      .transition()
      .duration(500) 
      .attr("y", function(d) { return chartHeight - Math.max(0,yScale(d.ChangeFromPreceding_Net)); })
      .attr("height", function(d) { return Math.abs(yScale(d.ChangeFromPreceding_Net)); }) 
      .delay(function(d,i){ if (i == 0) {return(1000)} else {return(1000+(i*100))}});
      });
    });
    function trimPresidentName (presName) {
      // Trim president name of spaces and periods
      if (typeof presName !== 'undefined') {
        return presName.replace(/\s/g, '').replace(/\./g, "");
      }
    }
}