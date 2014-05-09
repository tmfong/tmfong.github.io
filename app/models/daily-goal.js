import dateHelper from 'appkit/utils/date';

// Daily snapshots
App.DailyGoal = DS.Model.extend({
  goal: DS.belongsTo('goal'),
  day: DS.belongsTo('day'), 
  // title: function () {
  //   return this.get('goal').get('title');
  // }.property('goal'),

  investment: DS.attr(),
  earnings: function() {
    var activities = this.get('activities').get('content');
    var rewards = 0;
    for (var i = 0; i < activities.length; i++) {
      rewards += activities[i].get('reward');
    }
    if (rewards === 0) {
      // A daily goal doesn't have penalty unless the day has passed
      var thisDate = this.get('day').get('date');
      if (thisDate < dateHelper.todayDate()) {
        rewards = this.get('investment') * App.GAME_GOAL_DAILY_PENALTY;        
      }
    }
    return rewards;
  }.property('activities.@each.reward'),

  isActive: function() {
    return this.get('investment') > 0;
  }.property('investment'), 

  activities: DS.hasMany('activity'),
});

 export default App.DailyGoal;