import dateHelper from 'appkit/utils/date'
import goalHelper from 'appkit/utils/goal';
import configHelper from 'appkit/utils/config';

export default Ember.Route.extend({
  // beforeModel: function() {
  //   console.log('>> DaysRoute beforeModel');
  // },  
  // model: function() {
  //   console.log('>> DaysRoute model');
  //   var p3 = this.get('store').findAll('dailyGoal').then(
  //     function(result) {
  //       var dailyGoals = result.get('content');  
  //     }
  //   );
  // },
  // afterModel: function() {
  //   console.log('>> DaysRoute afterModel');      
  // },

  setupController: function(controller, model) {
    console.log('>> DaysRoute setupController');

    var store = this.get('store');
    var self = this;    

    // var p0 = store.findAll('day');
    // var p1 = store.findAll('activity');
    // var p2 = store.findAll('note');
    // var p3 = store.findAll('dailyGoal');
    // return Ember.RSVP.all([p0, p1, p2, p3]).then(function(array) {
    //   var days = array[0].get('content');
    //   var activities = array[1].get('content');
    //   var notes = array[2].get('content');   
    //   var dailyGoals = array[3].get('content');      

    var promises = {
      daysPromise: store.findAll('day'),
      activitiesPromise: store.findAll('activity'),
      dailyGoalsPromise: store.findAll('dailyGoal'),
      goalsPromise: store.findAll('goal'),      
    };

    return Ember.RSVP.hash(promises).then(function(hash) {
      var days = hash.daysPromise.get('content');
      var activities = hash.activitiesPromise.get('content');
      var dailyGoals = hash.dailyGoalsPromise.get('content'); 
      var goals = hash.goalsPromise.get('content'); 

      var lastDate = '2099-01-01'; //'2014-04-29';
      var lastDateChanged = false;

      // Connect days with their daily goals and notes
      for (var i = days.length - 1; i >= 0; i--) {
        var day = days[i];

        // if (day.get('date') > lastDate) {
        //   deleteDay(day); 
        //   lastDateChanged = true;
        //   continue;          
        // }

        // Connect daily goals
        for (var j = 0; j < dailyGoals.length; j++) {
          var dailyGoal = dailyGoals[j];

          // Connect with App.Goal
          for (var k=0; k < goals.length; k++) {
            var goal = goals[k];
            if (dailyGoal.get('goal').get('id') === goal.get('id')) {
              dailyGoal.set('goal', goal);
            }
          }

          // Connect with App.Day
          if (dailyGoal.get('day').get('id') === day.get('id')) {
            day.get('dailyGoals').addObject(dailyGoal);
            // Connect activities
            connectActivitiesAndSetupTheNextActivity(store, dailyGoal, activities);
          }
        }
      } // for days  

      if (lastDateChanged) {
        var lastCheckInDateVault = self.controllerFor('application').get('lastCheckInDateVault');
        configHelper.updateVault(lastCheckInDateVault, lastDate);           
      }

      controller.set('activities', hash.activitiesPromise);
      controller.set('goals', hash.goalsPromise);

      // NOTE: Okay, but model.isLoaded will be undefined
      // controller.set('model', days);
      controller.set('model', hash.daysPromise); 
    });

  },  

  // beforeModel: function(days) {
  //   var days = days.get('content');
  //   // Connect days with their daily goals and notes
  //   var lastDate = '2014-04-29';
  //   var promises = [];
  //   for (var i = days.length - 1; i >= 0; i--) {
  //     if (days[i].get('date') > lastDate) {
  //       promises.push(deleteDay(days[i]));   
  //     }
  //   }
  //   var self = this;
  //   return Ember.RSVP.all(promises).then(function(array){
  //     console.log('>> ApplicationRoute beforeModel RSVP then');

  //     var controller = self.controllerFor('application');
  //     var lastCheckInDateVault  = controller.get('lastCheckInDateVault');
  //     return configHelper.updateVault(lastCheckInDateVault, lastDate);           
  //   });  
  // },

  actions: {

    dailyCheckIn: function() {
      console.log('>> DaysRoute dailyCheckIn');
      dailyCheckIn(this); 
    },

    //
    // Activity
    //
    addingActivity: function(activity) {
      var now = new Date();
      activity.set('actionAt', now);
      activity.set('body', 'test');

      // Open modal dialog
      this.send('openModal', 'modal-activity', activity);
    }, 

    saveActivity: function(activity) {
      // console.log('>> DaysRoute addActivity', activity);      

      // Set body based on duration
      var clockStarts = activity.get('actionAt');
      var duration = moment().diff(clockStarts, 'minutes');
      if (duration < 1)  {
        activity.set('body', moment().from(moment().add('minutes', 1), true));
      } else {
        activity.set('body', moment().from(clockStarts, true));
      }
      // Save
      saveActivity(this, activity);

      // Close modal dialog
      this.send('closeModal');            
    }, 

    //
    // Goal
    //   
    updatingGoal: function(model) {
      if (!model) {
        model = creatingGoal(this.get('store'));        
      }
      this.send('openModal', 'modal-goal', model);
    }, 

    updateGoal: function(model) {
      // console.log('>> DaysRoute updateGoal', model);      
      // Save
      updateGoal(this, model);

      // Close modal dialog
      this.send('closeModal');            
    }, 

    investGoal: function(model) {
      model.set('investment', App.GAME_GOAL_INVESTMENT_LEVELS[0]);
      investGoal(this, model);    
    }
  }  
});


/* dailyCheckIn
 * Referenced: ApplicationRoute.dailyCheckIn
 */
function dailyCheckIn(context) {
  console.log('>> dailyCheckIn');  

  var controller = context.controllerFor('application');

  var lastCheckInDay = controller.get('lastCheckInDay');
  var lastCheckInDateVault  = controller.get('lastCheckInDateVault');

  if (lastCheckInDateVault.get('value') === dateHelper.todayDate()) return;

  var availableFunds = lastCheckInDay.get('availableFunds');
  var totalInvestments = lastCheckInDay.get('totalInvestments');

  // Create all the days between the last check-in and today
  lastCheckInDay = createNextDayFromDay(
    lastCheckInDay, 
    controller.get('store'), 
    lastCheckInDateVault,
    availableFunds,
    totalInvestments);
  controller.set('lastCheckInDay', lastCheckInDay);
};

// Create day from a previous day
function createNextDayFromDay(day, store, lastCheckInDateVault, availableFunds, totalInvestments) {
  console.log('>> createNextDayFromDay', day.get('date')); 
  // Next day's date   
  var newDate = nextDayDateFromDate(day.get('date'));
  var isCheckingIn = newDate === dateHelper.todayDate();
  var newDay = createDay(store, newDate, availableFunds, totalInvestments, isCheckingIn);

  if (newDate >= dateHelper.todayDate()) {
    configHelper.updateVault(lastCheckInDateVault, newDate);
    return newDate;

  } else {
    // Avoid using day.earnings as it relies on dailyGoals which are being created async
    availableFunds += totalInvestments * App.GAME_GOAL_DAILY_PENALTY;
    return createNextDayFromDay(newDay, store, lastCheckInDateVault, availableFunds, totalInvestments)
  }
};

function nextDayDateFromDate(date) {
  return moment(date).add('days', 1).format('YYYY-MM-DD');
};

function createDay(store, date, availableFunds, totalInvestments, isCheckingIn) {
  console.log('>> createDay');   
  var obj = {
    date: date,
    starterFunds: availableFunds,
    expenses: 0,
    totalInvestments: totalInvestments,
    checkedIn: isCheckingIn
  };
  var day = store.createRecord('day', obj); 
  day.save().then(
    function (result) {
      // Add daily goals, regardless isCheckingIn or not because they effect the daily earnings     
      store.find('goal').then(
        function(result) {
          var goals = result.get('content');
          createDailyGoals(store, day, goals);          
        }
      );                     
    }      
  );
  return day;
};


// Ref: dailyCheckIn > ... > createDay
function createDailyGoals(store, day, goals) {
  console.log('>> createDailyGoals');     
  // Loop through all goal records
  for (var i = 0; i < goals.length; i++) {
    var goalStartDate = goals[i].get('startDate');
    var goalEndDate = goals[i].get('endDate');
    var date = day.get('date');

    // If the goal range covers today
    if (goalStartDate <= date && date <= goalEndDate) {
      // Create daily goal
      goalHelper.createDailyGoal(store, day, goals[i]);
    }        
  } 
};


/****************************************
 *
 * Activity
 *
 */

function connectActivitiesAndSetupTheNextActivity(store, dailyGoal, activities) {
  // Set actions to their daily goals  
  var lastActionTime = App.DATE_NEVER;
  var hasNextActivity = false;

  for (var k = 0; k < activities.length; k++) {

    var activity = activities[k];
    if (activity.get('dailyGoal').get('id') === dailyGoal.get('id')) {
      dailyGoal.get('activities').addObject(activity);

      // Find the last activity
      if (activity.get('createdAt') > lastActionTime) {
        lastActionTime = activity.get('createdAt');
      }
      // Scheduled activity is in memory even after navigating to another route
      if (activity.get('isNew')) {
        hasNextActivity = true;
      }
    }
  }  

  // "next activity" doesn't survive a page refresh
  if (!hasNextActivity) {
    // Only invested goals can have actions today
    if (dailyGoal.get('day').get('isToday') && dailyGoal.get('isActive')) {
      // Setup the next action
      var sequence = dailyGoal.get('activities').get('content').length; 
      var actionAt = lastActionTime === App.DATE_NEVER ? 
        dateHelper.now() : 
        moment(lastActionTime).add('hours', App.ACTION_INTERVAL_IN_HOURS).format();    
      goalHelper.creatingNextActivity(store, dailyGoal, actionAt, sequence);
    }      
  }
};



function saveActivity(route, activity) {
  var store = route.get('store'); 
  var dailyGoal = activity.get('dailyGoal');

  // Finance
  //
  var investment = parseInt(dailyGoal.get('investment'), 10);
  var previousRewards = 0, reward = 0;

  // Calculate previous rewards
  var activities = dailyGoal.get('activities').get('content');
  for (var i = 0; i < activities.length; i++) {
    // Skip the current new activity
    if (activities[i].get('isNew')) continue;
    previousRewards += activities[i].get('reward');  
  }
  // Reward on current activity
  var reward = investment * (previousRewards === 0? App.GAME_GOAL_1ST_ACTION_REWARD : App.GAME_GOAL_ACTION_REWARD);
  
  // If not exceeding daily max, add to available funds
  if (reward + previousRewards <= investment * App.GAME_GOAL_MAX_ACTION_REWARD) {
    // Record the gain
    activity.set('reward', reward);    
  } 

  activity.set('createdAt', dateHelper.now());  
  activity.save().then(
    function (answer) {
      var actionAt = moment().add('hours', App.ACTION_INTERVAL_IN_HOURS).format();
      goalHelper.creatingNextActivity(store, dailyGoal, actionAt, activity.get('sequence')+1);
    }        
  );  
}


//
// Delete day
//

var deleteDay = function(day) {
  // Delete daily goals
  var promises = deleteDailyGoals(day);

  // Wait till all the promises are finished before delete the day
  return Ember.RSVP.all(promises).then(function(array){
    var date = day.get('date');
    console.log('>> deleteDay RSVP deleting', date);

    // Delete day record
    day.deleteRecord();
    return day.save().then(
      function(result) {
        console.log('>> deleteDay RSVP deleted', date);          
        return;
      }
    );
  });  
};

var deleteDailyGoals = function(day) {
  // NOTE: Count backwards when removing items from an array   
  var dailyGoals = day.get('dailyGoals').get('content');  
  var promises = [];
  for (var i = dailyGoals.length - 1; i >= 0; i--) {
    var dailyGoal = dailyGoals[i];

    // Delete activities    
    var activities = dailyGoal.get('activities').get('content');
    for (var j = activities.length - 1; j >= 0; j--) {
      var activity = activities[j];
      var isNew = activity.get('isNew');
      activity.deleteRecord();        
      if (!isNew) {       
        activity.save();
      }
    }
    var id = dailyGoal.get('id');
    // Delete daily goals
    dailyGoal.deleteRecord();
    // Collect the promises
    promises.push(dailyGoal.save().then(
      function(result){
        console.log('>> deleteDailyGoals deleted', id); 
      }
    ));
  }   

  return promises;
};

/****************************************
 *
 * Goal
 *
 */

// Create a goal but don't save it yet
function creatingGoal(store) {
  var obj = {
    title: 'Project ' + moment().format('MDD'),
    body: '',
    daily: true,
    startDate: App.DATE_FUTURE,
    endDate: App.DATE_FUTURE,
    investment: 0
  };
  return store.createRecord('goal', obj);
};

function updateGoal(store, goal) {
  // Completing the goal
  if (goal.get('isCompleted')){
    // NOTE: technique for figuring out what was changed
    var changes = goal.changedAttributes(); //=> { isCompleted: [oldValue, newValue] }
    if (changes.get('isCompleted')) {
      goal.set('endDate', dateHelper.todayDate());
      // TODO: accounting and stop dailygoal   
    }
  } 
  return goal.save();  
};


// Start a goal investment
// Assume today is checked in
function investGoal(route, goal) {
  var controller = route.controllerFor('application');


  // var fundVault = controller.get('availableFundsVault');
  // var investmentVault = controller.get('totalInvestmentsVault');
  // var lastCheckInDate = controller.get('lastCheckInDateVault').get('value');
  var lastCheckInDay = controller.get('lastCheckInDay');

  var expenses = lastCheckInDay.get('expenses');
  var totalInvestments = lastCheckInDay.get('totalInvestments');
  var availableFunds = lastCheckInDay.get('availableFunds');
  var pendingInvestment = goal.get('investment');
  if (availableFunds < pendingInvestment) return; // Not enough funds

  lastCheckInDay.set('expenses', expenses + pendingInvestment);
  lastCheckInDay.set('totalInvestments', totalInvestments + pendingInvestment);
  lastCheckInDay.save();

  // Create daily goal
  goalHelper.createDailyGoal(route.get('store'), lastCheckInDay, goal);   

  // Update goal record 
  goal.set('startDate', lastCheckInDay.get('date'));
  goal.save();  
};
