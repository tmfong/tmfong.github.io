export default Ember.Component.extend({
  style: function() {
    return currencyButtonCssClass(this.get('value'));
  }.property('value'),
  value: null,
  caption: null
});

function currencyButtonCssClass(currency) {
  var style = '';
  if (currency > 0) {
    style = 'btn btn-lg btn-success disabled';
  } else if (currency === 0) {
    style = 'btn btn-lg btn-disabled';
  } else {
    style = 'btn btn-lg btn-danger disabled';    
  }
  return style;  
};