import goalHelper from 'appkit/utils/goal';
import dateHelper from 'appkit/utils/date';

export default Ember.Route.extend({

  // beforeModel: function() {
  //   return clearTable(this.get('store'), 'activity');    
  //   clearTable(this.get('store'), 'dailyGoal');
  //   clearTable(this.get('store'), 'goal');
  //   return clearTable(this.get('store'), 'vault');  
  // },
  
  // model: function() {
  //   return this.get('store').find('day').then(
  //     function(result) {
  //       var days = result.get('content');
  //       // Connect days with their daily goals and notes
  //       for (var i = 0; i < days.length; i++) {
  //         if (days[i].get('date') >= '2014-04-21') {
  //           deleteDay(days[i]);
  //           // days[i].set('starterFunds', 200);
  //           // days[i].set('expenses', 0);
  //           // days[i].set('totalInvestments', 0);
  //           // days[i].save();      
  //         }
  //       }
  //     }
  //   );    
  // },

  // model: function() {
  //   return this.get('store').find('dailyGoal', {day: '_17njfcv76oo_js__N-uh'}).then(
  //     function(result) {
  //       var dailyGoals = result.get('content');
  //       // Connect days with their daily goals and notes
  //       for (var i = dailyGoals.length - 1; i >= 0; i--) {
  //         // Delete activities    
  //         var activities = dailyGoals[i].get('activities').get('content');
  //         for (var j = activities.length - 1; j >= 0; j--) {
  //           activities[j].deleteRecord();
  //           activities[j].save();
  //         }
  //         // Delete daily goals
  //         dailyGoals[i].deleteRecord();
  //         dailyGoals[i].save();
  //       }  
  //     }
  //   );    
  // },

  afterModel: function() {
    var self = this;
    var store = self.get('store');
    var controller = self.controllerFor('application');

    return store.findAll('vault').then(
      function(result) {
        var vaults = result.get('content');
        var lastCheckInDate;


        // Load preset records into controller, create them if first time
        if (vaults.length === 0) {
          lastCheckInDate = dateHelper.todayDate();          
          // lastCheckInDate = '2014-04-10'; // TEMP
          // Create new day 
          createDay(store, lastCheckInDate, App.GAME_STARTER_FUND, 0, true);
          // Create new vault
          var lastDayVault = newVault(store, App.VAULT_TYPE_DAY, App.VAULT_LAST_CHECK_IN_DATE, lastCheckInDate);
          controller.set('lastCheckInDateVault', lastDayVault);  

        } else {
          for (var i = 0; i < vaults.length; i++) {
            var type = vaults[i].get('type');
            var key = vaults[i].get('key');
            var value = vaults[i].get('value');

            // // TEMP
            // updateVault(vaults[i], '2014-04-20');

            if (type === App.VAULT_TYPE_DAY && key === App.VAULT_LAST_CHECK_IN_DATE) {  
              controller.set('lastCheckInDateVault', vaults[i]);
              lastCheckInDate = value;
            }
          } // for
        }
      }
    );
  },
  // TEMP: clean up
  setupController: function(controller, model) {
    console.log('>> ApplicationRoute setupController');

    var self = this;
    var store = self.get('store');

    var lastCheckInDate = controller.get('lastCheckInDateVault').get('value');
    return store.find('day', {date: lastCheckInDate}).then(
      function(result) {
        var day = result.get('content')[0];
        if (day) {
          controller.set('lastCheckInDay', day);
        }
      }
    );
  },

  actions: {
    dailyCheckIn: function() {
      console.log('>> ApplicationRoute dailyCheckIn');
      dailyCheckIn(this.get('controller')); 
    },
  }  
});


/* dailyCheckIn
 * Referenced: ApplicationRoute.dailyCheckIn
 */
function dailyCheckIn(controller) {
  console.log('>> dailyCheckIn');  

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
    updateVault(lastCheckInDateVault, newDate);
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

///////////////////////////////////////////////////////
//
// Maintenance
//

function clearTable(store, tableName) {
  return store.find(tableName).then(
    function(result) {
      var array = result.get('content');
      for (var i = array.length - 1; i >= 0; i--) {
        array[i].deleteRecord();
        array[i].save();
      }
    }
  );  
}

function newVault(store, type, key, value) {
  var obj = {
    type: type,
    key: key,
    value: value,
    editedAt: now()
  }
  var item = store.createRecord('vault', obj);
  item.save();
  return item;
};

function updateVault(item, value) {
  item.set('value', value);
  item.save(); 
}


var deleteDay = function(day) {
  // Delete daily goals
  deleteDailyGoals(day);
  // Delete day record
  day.deleteRecord();
  day.save();
};

var deleteDailyGoals = function(day) {
  // NOTE: Count backwards when removing items from an array   
  var dailyGoals = day.get('dailyGoals').get('content');  
  for (var i = dailyGoals.length - 1; i >= 0; i--) {
    // Delete activities    
    var activities = dailyGoals[i].get('activities').get('content');
    for (var j = activities.length - 1; j >= 0; j--) {
      activities[j].deleteRecord();
      activities[j].save();
    }
    // Delete daily goals
    dailyGoals[i].deleteRecord();
    dailyGoals[i].save();
  }    
};