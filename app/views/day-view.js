

export default Ember.View.extend({
  templateName: 'day-view',

  isLastDay: function() {
    return this.get('date');
  }.property('date'), 

  earningsStyle: function() {
    return currencyButtonCssClass(this.get('earnings'));
  }.property('availableFunds'),
  availableFundsStyle: function() {
    return currencyButtonCssClass(this.get('availableFunds'));
  }.property('availableFunds'),
  expensesStyle: function() {
    return currencyButtonCssClass(this.get('expenses'));
  }.property('expenses'),
});


