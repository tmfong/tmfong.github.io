import dateHelper from 'appkit/utils/date';

var createDailyGoal = function(store, day, goal) {
  console.log('>> createDailyGoal');    
  var obj = {
    goal: goal,
    day: day,
    investment: parseInt(goal.get('investment'), 10),
  }
  var dailyGoal = store.createRecord('dailyGoal', obj);
  dailyGoal.save().then(
    function(result){
      // Setup the next action
      creatingNextActivity(store, dailyGoal, dateHelper.now());      
    }
  );
  day.get('dailyGoals').addObject(dailyGoal);

};

// Ref: 
//  refresh page: connectActivitiesAndSetupTheNextActivity, 
//  add activity: saveActivity
//  check-in: createDailyGoal
var creatingNextActivity = function(store, dailyGoal, actionAt, sequence) {
  var obj = {
    dailyGoal: dailyGoal,
    sequence: sequence,
    body: '',
    reward: 0,
    actionAt: actionAt,
    createdAt: ''    
  }
  var activity = store.createRecord('activity', obj);  
  dailyGoal.get('activities').addObject(activity);

  return activity;   
};

export default {
  createDailyGoal: createDailyGoal,
  creatingNextActivity: creatingNextActivity
};

