export default Ember.Handlebars.makeBoundHelper(function(date) {
  return moment(date).format('h a');    
});