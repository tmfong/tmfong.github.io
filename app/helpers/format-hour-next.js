export default Ember.Handlebars.makeBoundHelper(function(date) {
  var duration = moment().diff(date, 'minutes');   
  if (duration > -30) {
    // Orginal scheduled time has been passed     
    return 'NOW';

  } else {
    // In the future    
    return moment(date).format('h a');    
  }
});