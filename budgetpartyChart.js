function generatePartyChart () {
  // Set margins for main chart
  var margin = { top: 20, right: 20, bottom: 90, left: 30 },
    width = 200 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom

  //President x axis
  //Get data
  d3.json('https://jclark017.github.io/d3_development/data/party.json', function (errorPres, partyData) {
    var xParty = d3.scale
      .ordinal()
      .domain(
        partyData.map(function (d) {
          return d.party
        })
      )
      .rangeRoundBands([0, width], 0.1)

    var yAxisScale = d3.scale
      .linear()
      .domain([100, -100])
      .range([0, height])
    var yAxisLeft = d3.svg
      .axis()
      .scale(yAxisScale)
      .ticks(8)
      .orient('left')

    var xAxisParty = d3.svg
      .axis()
      .scale(xParty)
      .orient('bottom')

    // create the SVG
    var svg = d3
      .select('body')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('id', 'svg2')
      .append('g')
      .attr('class', 'graph1')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    //paint the y axis
    svg
      .append('g')
      .attr('class', 'y axis axisLeft')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .attr('id', 'ytext')
      .call(yAxisLeft)
      .append('text')
      .attr('y', -10)
      .attr('x', 0 - height / 1.5)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .attr('transform', 'rotate(-90)')
      .attr('dy', '-2em')
      .text('Average Annual Change in Deficit(Surplus)')

      svg.selectAll('#ytext g text').attr('id', function (d) {
        return d <= 0 ? 'xtextgood' : "xtextbad";
      })

    // paint the x axis for presidents
    let xAxisPresPaint = svg
      .append('g')
      .attr('class', 'xPres axis')
      .attr(
        'transform',
        'translate(5,' + (height) + ')'
      )
      .call(xAxisParty)
      .selectAll('text')
      .attr('y', 25)
      .attr('x', -50)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .attr('dy', '.35em')

      svg.selectAll("g.xPres path").remove()

    // Paint President bars
    iPres = 0
    barsPres = svg
      .selectAll('.barPresident')
      .data(partyData)
      .enter()
    barsPres
      .append('rect')
      .attr('class', function (d) {
        return 'barPresident ' + d.party
      })
      .attr('x', function (d, i) {
        return xParty(d.party) + margin.left
      })
      .attr('y', function (d) {
        return yAxisScale(0)
      }) //animated later
      .attr('width', function (d) {
        return xParty.rangeBand()
      })
      .attr('height', 0) //animated later
      .attr('id', function (d, i) {
        return xParty.domain()[i]
      })

    // fetch Budget data to paint bars
    d3.csv('https://jclark017.github.io/d3_development/data/budget.csv', function (error, dataProto) {
      //Convert data formats
      var data = dataProto.map(function (currentObject) {
        return {
          Year: currentObject.Year,
          Net: parseFloat(-currentObject.Net),
          Preceding_Net: parseFloat(currentObject.Preceding_Net),
          ChangeFromPreceding_Net: parseFloat(
            currentObject.ChangeFromPreceding_Net
          ),
          Change_Net: parseFloat(currentObject.Change_Net),
          TotalDebt: parseFloat(currentObject.TotalDebt),
          PresidentParty: currentObject.PresidentParty,
          SenateMajorityParty: currentObject.SenateMajorityParty,
          HouseMajorityParty: currentObject.HouseMajorityParty,
          President: currentObject.President,
          SuperMajority: currentObject.SuperMajority
        }
      })

      function calcPresScale (presName) {
        return yAxisScale(
          d3.sum(
            data.filter(d => d.President === presName),
            d => d.ChangeFromPreceding_Net
          ) /
            d3.count(
              data.filter(d => d.President === presName),
              d => d.ChangeFromPreceding_Net
            )
        )
      }

      /*
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
      .delay(function(d,i){ if (i == 0) {return(1000)} else {return(1000+(i*1000))}});
*/

      var aggPres = {}
      setTimeout(() => {
        data.forEach((element, i) => {
          setTimeout(() => {
            curBar = svg.select('#' + element.PresidentParty)
            var curY = curBar.attr('y')
            var curHeight = curBar.attr('height')
            var curBarVal = 0
            // Define an object to hold incremental values for each president
            if (aggPres[element.PresidentParty] == undefined) {
              aggPres[element.PresidentParty] = {}
            }

            if (aggPres[element.PresidentParty].cnt == undefined) {
              aggPres[element.PresidentParty].cnt = 1
              aggPres[element.PresidentParty].avg =
                element.ChangeFromPreceding_Net
            } else {
              var tot =
                aggPres[element.PresidentParty].avg *
                aggPres[element.PresidentParty].cnt //reconstitute the total debt
              tot = tot + element.ChangeFromPreceding_Net //add the next value
              aggPres[element.PresidentParty].cnt =
                aggPres[element.PresidentParty].cnt + 1 //increment the divisor
              aggPres[element.PresidentParty].avg =
                tot / aggPres[element.PresidentParty].cnt //Store the new average
            }

            curBar
              .transition()
              .duration(500)
              .attr('y', function (d) {
                return Math.min(
                  yAxisScale(0),
                  curY -
                    (curY - yAxisScale(aggPres[element.PresidentParty].avg))
                )
              })
              .attr('height', function (d) {
                return Math.abs(
                  yAxisScale(0) -
                    yAxisScale(aggPres[element.PresidentParty].avg)
                )
              })
              //add style class to color the bar to this section
              .attr('class', function (d) {
                classes = curBar.attr('class').split(' ')
                //remove the bad/good classification currently stored
                classes = classes.filter(function (value, index, arr) {
                  return value != 'bad' && value != 'good'
                })
                //add the correct value based on the current average for this iteration
                if (aggPres[element.PresidentParty].avg > 0) {
                  classes.push('bad')
                } else {
                  classes.push('good')
                }

                //rejoin the string
                return classes.join(' ')
              })
          }, i * 100)
        })
      }, 1000)
    })
  })
}
