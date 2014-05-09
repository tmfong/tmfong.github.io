import config from 'appkit/utils/config';

export default Ember.View.extend({
  templateName: 'day-activities-view',  

  activityData: function() {
    var groups = [];        
    var goal = this.get('context').get('goal');
    var goalId = goal.get('id');    
    var days = this.get('controller').get('model');    
    console.log('>> DailyGoalViewController activityData for goal', goalId);

    for (var i = 0; i <= config.MAX_ACTIVITY_SEQUENCE; i++) {
      var group = activitySamples(days, goalId, i);
      groups.push(group);      
    }

    return groups;

  }.property('controller.activities.length'),
});

function isRecentDay(day) {
  var startDate = moment().add('days', - config.RECENT_DAYS_COUNT).format('YYYY-MM-DD');  
  return day.get('date') >= startDate;
}

function getDuration(activity) {
  if (activity && !activity.get('isNew')) {
    return activity.get('duration');
  }  
  return 0;
}

function activity(day, dailyGoal, activitySeq) {
  var duration = 0; 
  if (dailyGoal) {
    var activities = dailyGoal.get('activities').get('content');   
    if (activitySeq < config.MAX_ACTIVITY_SEQUENCE) {
      // All but the last sequence group: 0, 1, 2
      duration = getDuration(activities[activitySeq]);
    } else if (activitySeq < activities.length) {
      // Sum up the rest of the durations: 3...
      for (var i = activitySeq; i < activities.length; i++) {
        duration += getDuration(activities[i]);
      }
    }  
  }
  return {
    date: day.get('date'),
    y: duration
  };
}

function activitySamples(days, goalId, activitySeq) {

  return days.filter(isRecentDay).map(function(day) {
    // For each day
    var dailyGoals = day.get('dailyGoals').get('content');
    var dailyGoal;
    // Find the corresponding dailyGoal
    for (var i = 0; i < dailyGoals.length; i++) {
      if (dailyGoals[i].get('goal').get('id') === goalId) {
        dailyGoal = dailyGoals[i];
        break;
      };
    };
    // Get activities for that dailyGoal
    return activity(day, dailyGoal, activitySeq);
  });
}
