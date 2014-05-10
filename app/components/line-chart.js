// Adopted from Animated Pie and Line Char
// http://codepen.io/stefanjudis/full/gkHwJ
//
export default  Ember.Component.extend({
  // https://github.com/samselikoff/talks/blob/master/2-sep2013-d3-ember-simple-dashboard/css/style.css  
  // classNames: ['chart'], 

  height: 300,
  caption: null,

  didInsertElement: function() {
    Ember.run.once(this, 'update');
  },

  update: function() {  
    var elementId = this.get('elementId');
    var height = this.get('height');
    var caption = this.get('caption');
    var data = this.get('data');
    drawLineChart(elementId, data, height, caption);
  }.observes('data')

});


var DURATION = 1500;
var DELAY    = 500;

/**
 * draw the fancy line chart
 *
 * @param {String} elementId elementId
 * @param {Array}  data      data
 */
function drawLineChart(elementId, data, height, caption) {
  // // parse helper functions on top
  // var parse = d3.time.format( '%Y-%m-%d' ).parse;
  // // data manipulation first
  // data = data.map( function( datum ) {
  //   // console.log('>> before', datum.date );  
  //   datum.date = parse( datum.date );
  //   // console.log('>> after', datum.date );  
  //   return datum;
  // } );
  
  data = data.map(
    function(datum) {
      datum.date = adjustHours(datum.date, 0); // toDate(datum.date, 0.5);
      return datum;
    }
  );

  var containerEl = document.getElementById(elementId);

  var width       = containerEl.clientWidth;
  var height      = width * 0.5;
  if (height > 200) height = 200;

  var padding = {top: 20, right: 0, bottom: 40, left:40, none:0},      
    detailWidth  = 98,
    detailHeight = 55,
    detailMargin = 10;

  var container   = d3.select( containerEl );

  // // Clear for refresh
  // container.selectAll('svg')
  //           .remove();
              
  // container.append('svg')
  //           .attr("class", 'lineChart--svg');

  var svg = container.select( 'svg' )
                      .attr( 'width', width )
                      .attr( 'height', height );

  // x          = d3.time.scale().range( [ 0, width - detailWidth ] ),
  var minX = d3.min(data, function(d){return d.date;});
  var maxX = adjustHours(d3.max(data, function(d){return d.date;}), 24);
  var xScale = d3.time.scale()
                  .domain([minX, maxX])
                  .rangeRound([0, width - padding.left - padding.right]);

  var minY = d3.min(data, function(d) {return d.value;});
  var maxY = d3.max(data, function(d) {return d.value;});
  var yScale = d3.scale.linear()
                  .domain([minY, maxY])
                  .range([height - padding.bottom - padding.top, 0]);

  var xAxis = d3.svg.axis()
                .scale( xScale )
                .orient("bottom")
                .ticks(d3.time.days,1);     

  var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(height / (200 - padding.bottom) * 5);

  // adjustHours(d.date, -12) so that the dots are lining up the ticks
  var line = d3.svg.line()
                .interpolate( 'linear' )
                .x( function( d ) { return xScale( adjustTime(d.date) ) + padding.left; } )
                .y( function( d ) { return yScale( d.value ); } );
  
  var area = d3.svg.area()
                .interpolate( 'linear' )
                .x( function( d ) { return xScale( adjustTime(d.date) ) + padding.left; } )
                .y0( yScale(minY) )
                .y1( function( d ) { return yScale( d.value ); } );

  var startData = data.map(
    function( datum ) {
      return {
        date  : datum.date,
        value : 0
      };
    } 
  );
  
  var circleContainer;
  
  // Clear for refresh
  container.selectAll('path')
            .remove();
  container.selectAll('g')
            .remove();

  // svg.append( 'g' )
  //   .attr( 'class', 'lineChart--yAxisTicks' )
  //   .call( yAxisTicks );
  
  // Add the line path.
  svg.append( 'path' )
      .datum( startData )
      .attr( 'class', 'lineChart--areaLine' )
      .attr( 'd', line )
      .attr("transform","translate("+ padding.none + "," + (padding.top) +")")      
      .transition()
      .duration( DURATION )
      // .delay( DURATION / 2 )
      .attrTween( 'd', tween( data, line ) )
      .each( 'end', function() {
        drawCircles( data );
      } );  
  
  // Add the area path.
  svg.append( 'path' )
      .datum( startData )
      .attr( 'class', 'lineChart--area' )
      .attr( 'd', area )
      .attr("transform","translate(1," + (padding.top) +")") // Shift left by a tick width
      .transition()
      .duration( DURATION )
      .attrTween( 'd', tween( data, area ) );

  // // Compute the minimum and maximum date, and the maximum price.
  // x.domain( [ data[ 0 ].date, data[ data.length - 1 ].date ] );
  // // hacky hacky hacky :(
  // y.domain( [ 0, d3.max( data, function( d ) { return d.value; } ) + 700 ] );

  // svg.append( 'g' )
  //     .attr( 'class', 'lineChart--xAxisTicks' )
  //     .attr( 'transform', 'translate(' + detailWidth / 2 + ',' + height + ')' )
  //     .call( xAxisTicks );



  svg.append( 'g' )
      // .attr( 'class', 'lineChart--xAxis' )
      // .attr( 'transform', 'translate(' + detailWidth / 2 + ',' + ( height + 7 ) + ')' ) 
      .attr("class","x axis")      
      .attr("transform","translate("+ padding.left + "," + (height - padding.bottom) +")")              
      .call( xAxis );
  
  svg.selectAll(".x.axis text")
    .attr("transform", "rotate(-45)translate(0, 0)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("class","y axis")
    .attr("transform","translate(" + padding.left + "," + padding.top + ")")
    .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")   
      // .attr("transform", "rotate(-90)translate(0,-" + padding.left + ")")    
      .attr("y", 6)
      .attr("dy", ".71em")          
      .style("text-anchor", "end")        
      .text(caption);

  
  // Helper functions!!!
  function drawCircle( datum, index ) {
    circleContainer.datum( datum )
                  .append( 'circle' )
                  .attr( 'class', 'lineChart--circle' )
                  .attr( 'r', 5 )
                  .attr(
                    'cx',
                    function( d ) {
                      return xScale( adjustTime(d.date) ) + padding.left;
                    }
                  )
                  .attr(
                    'cy',
                    function( d ) {
                      return yScale( d.value );
                    }
                  )
                  .attr("transform","translate("+ padding.none + "," + (padding.top) +")")                      
                  // .on( 'mouseenter', function( d ) {
                  //   d3.select( this )
                  //     .attr(
                  //       'class',
                  //       'lineChart--circle lineChart--circle__highlighted' 
                  //     )
                  //     .attr( 'r', 7 );
                    
                  //     d.active = true;
                      
                  //     showCircleDetail( d );
                  // } )
                  // .on( 'mouseout', function( d ) {
                  //   d3.select( this )
                  //     .attr(
                  //       'class',
                  //       'lineChart--circle' 
                  //     )
                  //     .attr( 'r', 6 );
                    
                  //   if ( d.active ) {
                  //     hideCircleDetails();
                      
                  //     d.active = false;
                  //   }
                  // } )
                  // .on( 'click touch', function( d ) {
                  //   if ( d.active ) {
                  //     showCircleDetail( d )
                  //   } else {
                  //     hideCircleDetails();
                  //   }
                  // } )
                  // .transition()
                  // .delay( DURATION / 10 * index )
                  .attr( 'r', 6 );
  }
  
  function drawCircles( data ) {
    circleContainer = svg.append( 'g' );

    data.forEach( function( datum, index ) {
      drawCircle( datum, index );
    } );
  }
  
  // function hideCircleDetails() {
  //   circleContainer.selectAll( '.lineChart--bubble' )
  //                   .remove();
  // }
  
  // function showCircleDetail( data ) {
  //   var details = circleContainer.append( 'g' )
  //                     .attr( 'class', 'lineChart--bubble' )
  //                     .attr(
  //                       'transform',
  //                       function() {
  //                         var result = 'translate(';
                          
  //                         result += xScale( adjustTime(data.date) );
  //                         result += ', ';
  //                         result += yScale( data.value ) - detailHeight - detailMargin;
  //                         result += ')';
                          
  //                         return result;
  //                       }
  //                     );
    
  //   details.append( 'path' )
  //           .attr( 'd', 'M2.99990186,0 C1.34310181,0 0,1.34216977 0,2.99898218 L0,47.6680579 C0,49.32435 1.34136094,50.6670401 3.00074875,50.6670401 L44.4095996,50.6670401 C48.9775098,54.3898926 44.4672607,50.6057129 49,54.46875 C53.4190918,50.6962891 49.0050244,54.4362793 53.501875,50.6670401 L94.9943116,50.6670401 C96.6543075,50.6670401 98,49.3248703 98,47.6680579 L98,2.99898218 C98,1.34269006 96.651936,0 95.0000981,0 L2.99990186,0 Z M2.99990186,0' )
  //           .attr( 'width', detailWidth )
  //           .attr( 'height', detailHeight );
    
  //   // Text bubble
  //   var text = details.append( 'text' )
  //                     .attr( 'class', 'lineChart--bubble--text' );
    
  //   text.append( 'tspan' )
  //       .attr( 'class', 'lineChart--bubble--label' )
  //       .attr( 'x', detailWidth / 2 )
  //       .attr( 'y', detailHeight / 3 )
  //       .attr( 'text-anchor', 'middle' )
  //       .text( data.label );
    
  //   text.append( 'tspan' )
  //       .attr( 'class', 'lineChart--bubble--value' )
  //       .attr( 'x', detailWidth / 2 )
  //       .attr( 'y', detailHeight / 4 * 3 )
  //       .attr( 'text-anchor', 'middle' )
  //       .text( data.value );
  // }
  
  function tween( b, callback ) {
    return function( a ) {
      var i = (function interpolate() {
        return function( t ) {
          return a.map( function( datum, index ) {
            return {
              date  : datum.date,
              value : datum.value + b[ index ].value * t
            };
          } ); 
        };
      })();

      return function( t ) {
        return callback( i ( t ) );
      };
    };
  }
}   

function adjustHours(date, hours) {
  return moment(date).add('hours', hours).toDate();
}
function adjustTime(date) {
  return moment(date).add('hours', 0).toDate();
}

function toDate(date, inc) {
  return moment(date).add('days', inc).toDate();
}