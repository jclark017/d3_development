/*
function scale() {
  width = document.documentElement.clientWidth
  height = document.documentElement.clientHeight
  canvas.attr('width', width).attr('height', height)
  projection
    .scale((scaleFactor * Math.min(width, height)) / 2)
    .translate([width / 2, height / 2])
  render()
}
*/

var width = 1260,
    height = 900;

var proj = d3.geoNaturalEarth1()
    .scale(200)
    .translate([width / 2, height / 2])
// change this to 180 for transparent globe
    .clipAngle(90);


var path = d3.geoPath().projection(proj).pointRadius(2);

var graticule = d3.geoGraticule();
  
var london = [-0.118667702475932, 51.5019405883275];
  
var time = Date.now();
var rotate = [39.666666666666664, -30];
var velocity = [.015, -0];
  
var lineToPrev = function(d) {
  return path({"type": "LineString", "coordinates": [d.properties.prevCoordinates, d.geometry.coordinates]});
}

function stripWhitespace(str) {
  return str.replace(" ", "");
}

var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)

svg.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged));

//read the Google json data and convery to TopoJSON
d3.json("LocationHistoryMin.json", function (errorPres, data) {


})

queue()
    .defer(d3.json, "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json")
    .defer(d3.json, "historylocations.json")
    .defer(d3.json, "LocationHistoryMin.json")
    .await(ready);

function ready(error, world, places, places2) {

    places2 = convertTopo(places2);
    places = places2;

    svg.append("circle")
        .attr("cx", width / 2)
      	.attr("cy", height / 2)
        .attr("r", proj.scale())
        .attr("class", "noclicks")
    		.attr("fill", "none");
    
    svg.append("path")
        .datum(topojson.object(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule noclicks")
        .attr("d", path);

    svg.append("g").attr("class","points")
        .selectAll("text").data(places.features)
      .enter().append("path")
        .attr("class", "point")
        .attr("d", path);
  
  	var lines = svg.append("g").attr("class","lines")
        .selectAll(".lines").data(places.features)
        .enter().append("path")
        .attr("class", "lines")
    	.attr("id", d => stripWhitespace(d.properties.name))
        .attr("d", d => lineToPrev(d));
        
    var linePath = svg.selectAll(".lines path")

    linePath.each(function(d) {d.totalLength = this.getTotalLength();})
        .attr("stroke-dashoffset", function (d,i) {return d.totalLength})
        .attr("stroke-dasharray",  function (d,i) {return d.totalLength + " " + d.totalLength})

    

/*
    svg.append("g").attr("class","labels")
        .selectAll("text").data(places.features)
      .enter().append("text")
      .attr("class", "label")
      .text(d => d.properties.name)
      .on("mouseover", (d) => {
      	var distance = Math.round(d3.geoDistance(d.geometry.coordinates, london) * 6371);
      	d3.select("g.info").select("text.distance").text("Distance from London: ~" + distance + "km");
      	var name = stripWhitespace(d.properties.name);
      	d3.select("g.lines").select("#" + name).style("stroke-opacity", 1)
    	})
    	.on("mouseout", (d) => {
      	var name = stripWhitespace(d.properties.name);
      	d3.select("g.lines").select("#" + name).style("stroke-opacity", 0.3)
        d3.select("g.info").select("text.distance").text("Distance from London: Hover Over A Location");
    	});
*/  
    svg.append("g").attr("class","countries")
      .selectAll("path")
        .data(topojson.object(world, world.objects.countries).geometries)
      .enter().append("path")
        .attr("d", path); 

    position_labels();
/*  
  	svg.append("g").attr("class", "info")
      .append("text")
    	.attr("class", "distance")
      .attr("x", width / 20)
      .attr("y", height * 0.9)
    	.attr("text-anchor", "start")
    	.style("font-size", "12px")
      .text("Distance from London: Hover Over A Location");  
  */
  	refresh(lines);
  
  	spin();
}



function position_labels() {
  var centerPos = proj.invert([width/2,height/2]);

  svg.selectAll(".label")
    .attr("text-anchor", (d) => {
      var x = proj(d.geometry.coordinates)[0];
      return x < width/2-20 ? "end" :
             x < width/2+20 ? "middle" :
             "start"
    })
    .attr("transform", (d) => {
      var loc = proj(d.geometry.coordinates),
        x = loc[0],
        y = loc[1];
      var offset = x < width/2 ? -5 : 5;
      return "translate(" + (x+offset) + "," + (y-2) + ")"
    })
    .style("display", (d) => {
      var d = d3.geoDistance(d.geometry.coordinates, centerPos);
      return (d > 1.57) ? 'none' : 'inline';
    })
    
}

function refresh(lines) {
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".countries path").attr("d", path);
  svg.selectAll(".graticule").attr("d", path);
  svg.selectAll(".point").attr("d", path);
  svg.selectAll(".lines").attr("d", (d) => { if (d) { return lineToPrev(d); }});
/*position_labels();*/
}

  
var timer;
  
function spin() {
  timer = d3.timer(function() {
    var dt = Date.now() -time;
    
    proj.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
    
    refresh();
  });
}
  
function dragstarted() {
  timer.stop();
  v0 = versor.cartesian(proj.invert(d3.mouse(this)));
  r0 = proj.rotate();
  q0 = versor(r0);
}
  
function dragged() {
  var v1 = versor.cartesian(proj.rotate(r0).invert(d3.mouse(this))),
      q1 = versor.multiply(q0, versor.delta(v0, v1)),
      r1 = versor.rotation(q1);
  proj.rotate(r1);
  refresh();
}

//Object definitions
function newFeature(location, prevLocation) {
    this.type = "Feature";
    this.properties = new newProperties(location.timestampMs, prevLocation);
    this.geometry = new newGeometry(location.latitudeE7, location.longitudeE7);
}

function newProperties(timestamp, prevLocation) {
    this.time = timestamp;
    this.name = "";
    this.prevCoordinates = [];

    this.prevCoordinates.push(prevLocation.longitudeE7/1e7);
    this.prevCoordinates.push(prevLocation.latitudeE7/1e7);

}

function newGeometry(lat, lon) {
    this.type = "Point";
    this.coordinates = [];
    //Handle google overflow bug
    if (lat > 900000000 ) {lat = lat - 4294967296} 
    if (lon > 1800000000) {lon = lon - 4294967296} 

    this.coordinates.push(lon/1e7);

    this.coordinates.push(lat/1e7);
}

function convertTopo (data) {
    
    newTopo = JSON.parse('{"type": "FeatureCollection","features": []}');

    prevLocation = {}

    for (var i in data.locations) {
        //For the first iteration, set the value of prevLocation
        if (typeof prevLocation.timestampMs === "undefined") {
            prevLocation = data.locations[i]
         } 

        newFeat = new newFeature(data.locations[i], prevLocation);

        //calculate the distance between two points
        crowDist = calcCrow(
                newFeat.geometry.coordinates[1],
                newFeat.geometry.coordinates[0],
                newFeat.properties.prevCoordinates[1],
                newFeat.properties.prevCoordinates[0],
                )

        console.log(crowDist)

        if (crowDist > 50) {
            newTopo['features'].push(newFeat);
            prevLocation = data.locations[i];
        }
        
        
    }
    console.log (newTopo);
    console.log (JSON.stringify(newTopo));

    return newTopo
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) 
    {
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }