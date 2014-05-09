// Adopted from
//  Ember data observer pattern: https://github.com/samselikoff/talks/blob/master/2-sep2013-d3-ember-simple-dashboard/part5-flexibility.html
//  "Stack bar-charts on time scale", http://bl.ocks.org/anupsavvy/9513382
//
export default  Ember.Component.extend({
  // https://github.com/samselikoff/talks/blob/master/2-sep2013-d3-ember-simple-dashboard/css/style.css  
  // classNames: ['chart'], 

  height: 300,

  didInsertElement: function() {
    Ember.run.once(this, 'update');
  },

  update: function() {

    console.log('>> BarChartComponent update');

    var elementId = this.get('elementId');
    var containerEl = document.getElementById(elementId);
    var width = containerEl.clientWidth;
    // var height = this.get('height');
    var height      = width * 0.5;  
    var padding = {top: 20, right: 0, bottom: 40, left:40, none:0};
    var barWidth = (width - padding.left - padding.right) / 14;

    // console.log('>> BarChartComponent update w =', w);

    if (!this.get('isLoaded')) {return;}

    var dataset = this.get('data');
    // console.log('>> BarChartComponent update', dataset);

    //Set up stack method
    var stack = d3.layout.stack();
    stack(dataset);

    //Set up scales
    var xScale = d3.time.scale()
      .domain([
        addDays(d3.min(dataset[0], function(d){return d.date}), 0), 
        addDays(d3.max(dataset[0], function(d){return d.date}), 1)
        ])
      .rangeRound([0, width - padding.left - padding.right]);

    var yScale = d3.scale.linear()
      .domain([0,       
        d3.max(dataset, function(d) {
          return d3.max(d, function(d) {
            return d.y0 + d.y;
          });
        })
      ])
      .range([height - padding.bottom - padding.top,0]);

    var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom")
                  .ticks(d3.time.days,1);

    var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
                  // .ticks(5);
                  .ticks(height / (200 - padding.bottom) * 5);
// console.log('>> ticks', (height / (200 - padding.bottom) * 5));

    var container   = d3.select( containerEl ),
    svg = container.select( 'svg' )
                    .attr("width", width)
                    .attr("height", height);

    // Clear for refresh
    svg.selectAll("g")
      .remove();

    // Add a group for each row of data
    var groups = svg.selectAll("g")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class","rgroups")
      .attr("transform","translate("+ (padding.left) + "," + (height - padding.bottom) +")")
      .style("fill", function(d, i) {
        return color_hash[dataset.indexOf(d)][1];
      });

    // Add a rect for each data value
    var rects = groups.selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append("rect")
      .attr("width", 2)
      .style("fill-opacity",1e-6);

    rects
      .attr("x", function(d) {
        return xScale(addDays(d.date, 0));
      })
      .attr("y", function(d) {
        return -(- yScale(d.y0) - yScale(d.y) + (height - padding.top - padding.bottom)*2);
      })
      .attr("height", function(d) {
        return -yScale(d.y) + (height - padding.top - padding.bottom);
      })
      .attr("width", barWidth)
      .style("fill-opacity",1);

    svg.append("g")
      .attr("class","x axis")
      .attr("transform","translate("+ padding.left + "," + (height-padding.bottom) +")")            
      .call(xAxis);

    svg.selectAll(".x.axis text")
        .attr("transform", "rotate(-45)translate(0, 0)")
        .style("text-anchor", "end");

    svg.append("g")
      .attr("class","y axis")
      .attr("transform","translate(" + padding.left + "," + padding.top + ")")
      .call(yAxis)
      .append("text")
        // .attr("transform", "rotate(-90)")        
        .attr("transform", "rotate(-90)translate(0,-" + padding.left + ")")    
        .attr("y", 6)
        .attr("dy", ".71em")          
        .style("text-anchor", "end")        
        .text("Minutes");
          
  }.observes('data')
});

function addDays(date, days) {
  return moment(date).add('days', days).toDate();
}



var color_hash = {
    0 : ["1st","#5cb85c"],
    1 : ["2nd","#5bc0de"],
    2 : ["3rd","#ff7f0e"],
    3 : ["Others","red"]        
};
