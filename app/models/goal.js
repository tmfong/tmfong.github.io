import dateHelper from 'appkit/utils/date';

App.Goal = DS.Model.extend({
  title: DS.attr(),
  body: DS.attr(),

  daily: DS.attr(),
  startDate: DS.attr(),
  endDate: DS.attr(),
  isCompleted: function() {
    return this.get('endDate') <= dateHelper.todayDate();
  }.property('endDate'), 

  investment: DS.attr(), 
  isInvested: function() {
    return this.get('investment') > 0;
  }.property('investment'),   

  dailyGoals: DS.hasMany('dailyGoal')
});

export default App.Goal;