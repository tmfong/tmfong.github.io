import dateHelper from 'appkit/utils/date'
import goalHelper from 'appkit/utils/goal';

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
    var p0 = store.findAll('day');
    var p1 = store.findAll('activity');
    var p2 = store.findAll('note');
    var p3 = store.findAll('dailyGoal');

    return Ember.RSVP.all([p0, p1, p2, p3]).then(function(array) {
      var days = array[0].get('content');
      var activities = array[1].get('content');
      var notes = array[2].get('content');   
      var dailyGoals = array[3].get('content');      

      // Connect days with their daily goals and notes
      for (var i = 0; i < days.length; i++) {

        // Connect notes
        for (var j = 0; j < notes.length; j++) {
          if (notes[j].get('day').get('id') === days[i].get('id')) {
            days[i].get('notes').addObject(notes[j]);
          }
        } 

        // Connect daily goals
        for (var j = 0; j < dailyGoals.length; j++) {
          if (dailyGoals[j].get('day').get('id') === days[i].get('id')) {
            days[i].get('dailyGoals').addObject(dailyGoals[j]);
            // Connect activities
            connectActivitiesAndSetupTheNextActivity(store, dailyGoals[j], activities);
          }
        }
      } // for days  

      controller.set('content', days); 
    });

  },  

  actions: {
    //
    // Day record
    //
    update: function(day) {
      console.log('>> update', day);    
      this.controllerFor("application").set('isEditing', false);

      var self = this;
      day.save(); 
    },

    //
    // Action activity
    //
    saveActivity: function(activity) {
      console.log('>> DaysRoute saveActivity', activity);  
      saveActivity(this, activity);   
    },

    //
    // Note
    //
    addingNote: function(day) {
      creatingNote(this.get('store'), day);
    },
    updateNote: function(note) {
      console.log('>> DaysRoute updateNote', note);
      // Abandoned new notes?
      if (note.get('isNew')) {
        // If blank, delete it
        if (!note.get('body').trim()) {
          note.deleteRecord();
          return;
        }         
      }      
      // Update storage
      note.set('editedAt', dateHelper.now());
      note.save();  
    },
  }  
});



//
// Action activity
//


function connectActivitiesAndSetupTheNextActivity(store, dailyGoal, activities) {
  // Set actions to their daily goals  
  var lastActionTime = App.DATE_NEVER;
  var hasNextActivity = false;
  for (var k = 0; k < activities.length; k++) {
    if (activities[k].get('dailyGoal').get('id') === dailyGoal.get('id')) {
      dailyGoal.get('activities').addObject(activities[k]);
      // Find the last activity
      if (activities[k].get('createdAt') > lastActionTime) {
        lastActionTime = activities[k].get('createdAt');
      }
      // Scheduled activity is in memory even after navigating to another route
      if (activities[k].get('isNew')) {
        hasNextActivity = true;
      }
    }
  }  

  if (!hasNextActivity) {
    // Only invested goals can have actions today
    if (dailyGoal.get('day').get('isToday') && dailyGoal.get('isActive')) {
      // Setup the next action
      var actionAt = lastActionTime === App.DATE_NEVER ? 
        dateHelper.now() : moment(lastActionTime).add('hours', App.ACTION_INTERVAL_IN_HOURS).format();    
      goalHelper.creatingNextActivity(store, dailyGoal, actionAt);
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
      goalHelper.creatingNextActivity(store, dailyGoal, actionAt);
    }        
  );  
}


//
// Note
//

function creatingNote(store, day) {
  var obj = {
    day: day,
    tag: '',
    body: '',
    editedAt: dateHelper.now()
  }
  var note = store.createRecord('note', obj);
  day.get('notes').addObject(note);
  return note;
};
