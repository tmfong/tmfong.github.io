import goalHelper from 'appkit/utils/goal';
import dateHelper from 'appkit/utils/date';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').find('goal');
  },

  actions: {
    adding: function() {
      var store = this.get('store');
      creatingGoal(store);

      this.toggleProperty('isNew');      
    },

    update: function(goal) {
      if (goal.get('isNew')) {
        this.controller.set('isNew', false)
        // If blank, delete it
        if (!goal.get('title').trim()) {
          goal.deleteRecord();
          return;
        }         
      }

      var store = this.get('store');      
      updateGoal(store, goal);
    },  

    invest: function(goal) {
      investGoal(this, goal);
    },

  }
});


// Create a goal but don't save it yet
function creatingGoal(store) {
  var obj = {
    title: '',
    body: '',
    daily: true,
    startDate: App.DATE_FUTURE,
    endDate: App.DATE_FUTURE,
    investment: 0
  };
  var goal = store.createRecord('goal', obj);
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

  goal.save();  
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