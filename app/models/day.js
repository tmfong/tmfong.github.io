import dateHelper from 'appkit/utils/date';

App.Day = DS.Model.extend({
  // Date
  //
  date: DS.attr(),
  // dateString is a proxy for safe editing
  dateString: function() {
    return this.get('date');
  }.property('date'),
  isToday: function() {
    return this.get('date') === dateHelper.todayDate();
  }.property('date'), 
  dateDisplay: function() {
    return this.get('dateString') && moment(this.get('dateString')).isValid() ? 
      moment(this.get('dateString')).format('MMMM D') : '';
  }.property('dateString'),
  dayOfWeek: function() {
    return this.get('dateString') && moment(this.get('dateString')).isValid() ? 
      moment(this.get('dateString')).format('ddd') : '';
  }.property('dateString'),

  // Finance
  //  
  starterFunds: DS.attr(),  
  earnings: function() {
    var dailyGoals = this.get('dailyGoals').get('content');
    var rewards = 0;
    for (var i = 0; i < dailyGoals.length; i++) {
      rewards += dailyGoals[i].get('earnings');
    }
    return rewards;
  }.property('dailyGoals.@each.earnings'),

  expenses: DS.attr(),  // Funds converted to goal investments
  hasInvestments: function() {
    return this.get('expenses') > 0;
  }.property('expenses'),    

  totalInvestments: DS.attr(), 

  availableFunds: function() {
    return this.get('starterFunds') + 
      this.get('earnings') -
      this.get('expenses');    
  }.property('starterFunds', 'earnings', 'expenses'),

  totalAssets: function() {
    return this.get('totalInvestments') + 
      this.get('starterFunds') + 
      this.get('earnings');
  }.property('starterFunds', 'earnings', 'totalInvestments'),


  // Status
  //
  checkedIn: DS.attr(),

  notes: DS.hasMany('note'),
  dailyGoals: DS.hasMany('dailyGoal')
});

export default App.Day;