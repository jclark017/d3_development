function generateLargeChart () {
  // Set margins for main chart
  var margin = { top: 0, right: 80, bottom: 0, left: 80 },
    width = 1400 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    chartHeight = 600,
    iPres = 0

  // Year x Axis
  var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1)

  var xAxis = d3.svg
    .axis()
    .scale(x)
    .orient('bottom')

  //President x axis
  //Get data
  d3.json('presidents.json', function (errorPres, presData) {
    var xPres = d3.scale.ordinal().domain(
      presData.map(function (d) {
        return d.Name
      })
    )
    /*.range(presData.map(function (d, i) {
        iPres += d.yrs*10;
        console.log(d3.sum(presData, function(d) { return d.yrs; }));
        console.log(d.Name + ":" + (iPres)); 
        return iPres; 
      }))*/

    var xAxisPres = d3.svg
      .axis()
      .scale(xPres)
      .orient('bottom')

    // tooltip variable
    var tip = d3
      .tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function (d) {
        if (d.Net > 0) {
          NetDescription = 'Deficit'
        } else {
          NetDescription = 'Surplus'
        }

        if (d.ChangeFromPreceding_Net > 0) {
          if (NetDescription == 'Surplus') {
            ChgDescription = 'decrease'
          } else {
            ChgDescription = 'increase'
          }
        } else {
          if (NetDescription == 'Surplus') {
            ChgDescription = 'increase'
          } else {
            ChgDescription = 'decrease'
          }
        }
        var ret =
          "<strong>Fiscal Year:</strong> <span style='color:white'>" +
          d.Year +
          '</span>'
        ret =
          ret +
          '<br/><strong>' +
          d.Year +
          ' ' +
          NetDescription +
          ":</strong> <span style='color:white'>$" +
          Math.abs(d.Net) +
          'bn</span>'
        ret =
          ret +
          '<br/><strong>' +
          NetDescription +
          " Change:</strong> <span style='color:white'>$" +
          Math.abs(d.ChangeFromPreceding_Net) +
          'bn ' +
          ChgDescription +
          '</span>'
        return ret
      })

    // create left axis scales
    var yAxisScale = d3.scale
      .linear()
      .domain([800, 1100])
      .range([height, 0])
    var yScale = d3.scale
      .linear()
      .domain([20, 80])
      .range([height, 0])
    // create left yAxis
    var yAxisLeft = d3.svg
      .axis()
      .scale(yAxisScale)
      .ticks(16)
      .orient('left')

    // create left axis scales
    var yAxisScaleRight = d3.scale
      .linear()
      .domain([800, 1100])
      .range([height, 0])
    var yScaleRight = d3.scale
      .linear()
      .domain([20, 80])
      .range([height, 0])
    // create right yAxis
    var yAxisRight = d3.svg
      .axis()
      .scale(yAxisScaleRight)
      .ticks(16)
      .orient('right')

    var svg = d3
      .select('body')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', chartHeight + 500)
      .append('g')
      .attr('class', 'graph')
      .attr('transform', 'translate(' + margin.left + ',' + '80' + ')')

    svg.call(tip)

    d3.csv('budget.csv', type, function (error, dataProto) {
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
          TotalDebt: parseFloat(currentObject.TotalDebt)
        }
      })

      x.domain(
        data.map(function (d) {
          return d.Year
        })
      )

      xPres.range(
        presData.map(function (d, i) {
          //iPres += d.yrs;
          var xPresWid =
            width *
            (iPres /
              d3.sum(presData, function (d) {
                return d.yrs
              }))
          console.log(
            d3.sum(presData, function (d) {
              return d.yrs
            })
          )
          console.log(d.Name + ':' + xPresWid)
          iPres += d.yrs
          return xPresWid
        })
      )

      //Left Axis
      //Scale with negative values
      yScale
        .domain([
          0,
          d3.max(data, function (d) {
            return d.ChangeFromPreceding_Net
          })
        ])
        .range([0, chartHeight])
      //Scale with 0 lower bound
      yAxisScale
        .domain([
          d3.min(data, function (d) {
            return d.ChangeFromPreceding_Net
          }),
          d3.max(data, function (d) {
            return d.ChangeFromPreceding_Net
          })
        ])
        .range([
          chartHeight -
            yScale(
              d3.min(data, function (d) {
                return d.ChangeFromPreceding_Net
              })
            ),
          0
        ])

      //Right Axis
      //Scale with negative values
      yScaleRight
        .domain([
          0,
          d3.max(data, function (d) {
            return d.Net
          })
        ])
        .range([0, chartHeight])
      //Scale with 0 lower bound
      yAxisScaleRight
        .domain([
          d3.min(data, function (d) {
            return d.Net
          }),
          d3.max(data, function (d) {
            return d.Net
          })
        ])
        .range([
          chartHeight -
            yScaleRight(
              d3.min(data, function (d) {
                return d.Net
              })
            ),
          0
        ])

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr(
          'transform',
          'translate(-12,' +
            (chartHeight -
              yScale(
                d3.min(data, function (d) {
                  return d.ChangeFromPreceding_Net
                })
              )) +
            ')'
        ) //" + chartHeight + ")")
        .call(xAxis)
        .selectAll('text')
        .attr('y', -14)
        .attr('x', 25)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(90)')

      // paint the axis for presidents
      let xAxisPresPaint = svg
        .append('g')
        .attr('class', 'xPres axis')
        .attr(
          'transform',
          'translate(14,' +
            (chartHeight -
              yScale(
                d3.min(data, function (d) {
                  return d.ChangeFromPreceding_Net
                })
              )) +
            ')'
        ) //" + chartHeight + ")")
        .call(xAxisPres)
        .selectAll('text')
        .attr('y', -14)
        .attr('x', 50)
        .style('text-anchor', 'middle')
        .attr('dy', '.35em')

      svg.selectAll('g.xPres g.tick text').attr('font-size', '10')
      svg.selectAll('g.xPres g.tick line').remove()
      svg.selectAll('g.xPres path').remove()

      svg
        .append('g')
        .attr('class', 'y axis axisLeft')
        .attr('transform', 'translate(0,0)')
        .attr('id', 'xtext')
        .call(yAxisLeft)
        .append('text')
        .attr('y', -10)
        .attr('x', 0 - height / 2)
        .style('text-anchor', 'middle')
        .style('font-size', '18px')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '-2em')
        .text('Yearly Change in Deficit (Billions)')

      svg
        .append('g')
        .attr('class', 'y axis axisRight')
        .attr('transform', 'translate(' + width + ',0)')
        .attr('id', 'xtext')
        .call(yAxisRight)
        .append('text')
        .attr('y', 60)
        .attr('x', 0 - height / 2)
        .style('text-anchor', 'middle')
        .style('font-size', '18px')
        .attr('transform', 'rotate(-90)')
        .text('Total Annual Deficit (Billions)')

      //Paint the axis text color
      svg.selectAll('#xtext g text').attr('id', function (d) {
        if (d <= 0) {
          return 'xtextgood'
        }
      })

      // Paint President background bars
      iPres = 0
      barsPres = svg
        .selectAll('.barPres')
        .data(presData)
        .enter()
      barsPres
        .append('rect')
        .attr('class', 'barPres')
        .attr('class', function (d) {
          return 'barPres ' + d.party
        })
        .attr('x', function (d, i) {
          if (i == 0) {
            return xPres(d.Name) + 13
          } else {
            return xPres(d.Name) + 14
          }
        })
        .attr('y', 600) //animated later
        .attr('width', function (d, i) {
          if (i == 0) {
            return xPres.range()[i + 1] - xPres.range()[i] - 1
          } else {
            if (isNaN(xPres.range()[i + 1])) {
              return width - xPres.range()[i] - 20
            } else {
              return xPres.range()[i + 1] - xPres.range()[i] - 1
            }
          }
          //xPres(d.Name[i+1]);
        })
        .attr('height', 100) //animated later

      // Paint the deficit change bars
      bars = svg
        .selectAll('.bar')
        .data(data)
        .enter()
      bars
        .append('rect')
        .attr('class', function (d) {
          //Set a class value for good or bad
          if (d.ChangeFromPreceding_Net > 0) {
            var chg = 'bad'
          } else {
            var chg = 'good'
          }

          if (d.Year > '2019') {
            return 'bar2 ' + chg
          } else {
            return 'bar1 ' + chg
          }
        })
        .attr('x', function (d) {
          return x(d.Year)
        })
        .attr('y', 600) //animated later
        .attr('width', x.rangeBand())
        .attr('height', 0) //animated later
        //tooltips
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)

      var lineFunction = d3.svg
        .line()
        .x(function (d) {
          return x(d.Year) + x.rangeBand() / 2
        })
        .y(function (d) {
          return yAxisScaleRight(d.Net)
        })

      // Draw the deficit line
      svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('class', 'line')
        .attr('id', 'actual')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 5)
        .style('opacity', '0') //Set invisible initially
        .attr(
          'd',
          lineFunction(
            data.filter(function (d) {
              return d.Year < '2021'
            })
          )
        )

      // Draw the forecast line
      svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('class', 'line')
        .attr('id', 'forecast')
        .style('stroke-dasharray', '3, 3')
        .style('opacity', '0') //Set invisible initially
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 5)
        .attr(
          'd',
          lineFunction(
            data.filter(function (d) {
              return d.Year > '2019'
            })
          )
        )

      //Animation for Presidents
      svg
        .selectAll('rect.barPres')
        .transition()
        .duration(500)
        .attr('y', 0)
        .attr('height', height / 0.71)
        .delay(function (d, i) {
          return i * 100
        })

      //Animation for rectangles
      svg
        .selectAll('rect.bar1, rect.bar2')
        .transition()
        .duration(500)
        .attr('y', function (d) {
          return chartHeight - Math.max(0, yScale(d.ChangeFromPreceding_Net))
        })
        .attr('height', function (d) {
          return Math.abs(yScale(d.ChangeFromPreceding_Net))
        })
        .delay(function (d, i) {
          if (i == 0) {
            return 1000
          } else {
            return 1000 + i * 100
          }
        })

      // Then highlight the main line to be fully visable and give it a thicker stroke
      d3.select('#actual')
        .style('opacity', '1')
        .style('stroke-width', 5)

      // First work our the total length of the line
      var totalLength = d3
        .select('#actual')
        .node()
        .getTotalLength()

      d3.selectAll('#actual')
        // Set the line pattern to be an long line followed by an equally long gap
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        // Set the intial starting position so that only the gap is shown by offesetting by the total length of the line
        .attr('stroke-dashoffset', totalLength)
        // Then the following lines transition the line so that the gap is hidden...
        .transition()
        .delay(1000)
        .duration(3400)
        .ease('quad') //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
        .attr('stroke-dashoffset', 0)

      d3.selectAll('#forecast')
        .transition()
        .delay(4400)
        .duration(1000)
        .ease('quad') //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
        .style('opacity', '1')
    })
  })
  function type (d) {
    d.money = +d.money
    return d
  }
}
