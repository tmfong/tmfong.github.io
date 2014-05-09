import goalHelper from 'appkit/utils/goal';
import dateHelper from 'appkit/utils/date';
import configHelper from 'appkit/utils/config';

export default Ember.Route.extend({

  // beforeModel: function() {
  //   return configHelper.clearTable(this.get('store'), 'activity');    
  // },
  
  // // Delete activities for a given dailyGoal (CAUTION: last day only)
  // beforeModel: function() {
  //   return this.get('store').find('activity', {dailyGoal: '_17odich4uh0_js_GJlIa'}).then(
  //     function(result) {
  //       var activities = result.get('content');
  //       console.log('>> ApplicationRoute beforeModel', activities.length);

  //       var promises = [];
  //       for (var j = activities.length - 1; j >= 0; j--) {
  //         activities[j].deleteRecord();
  //         promises.push(activities[j].save());
  //       }  
  //       // Wait till all the promises are finished before delete the day
  //       return Ember.RSVP.all(promises).then(function(array){
  //         console.log('>> ApplicationRoute beforeModel RSVP then');
  //         return;            
  //       });
  //     }
  //   );    
  // },

  // Setup or load lastCheckInDateVault
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
          var lastDayVault = configHelper.newVault(store, App.VAULT_TYPE_DAY, App.VAULT_LAST_CHECK_IN_DATE, lastCheckInDate);
          controller.set('lastCheckInDateVault', lastDayVault);  

        } else {
          for (var i = 0; i < vaults.length; i++) {
            var type = vaults[i].get('type');
            var key = vaults[i].get('key');
            var value = vaults[i].get('value');

            if (type === App.VAULT_TYPE_DAY && key === App.VAULT_LAST_CHECK_IN_DATE) {  
              controller.set('lastCheckInDateVault', vaults[i]);
              lastCheckInDate = value;
            }
          } // for
        }
      }
    );
  },

  // Cache lastCheckInDay 
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
    //
    // Modal
    // 
    openModal: function(modalName, model) {
      // console.log('>> ApplicationRoute openModal', modalName, model);   

      this.controllerFor(modalName).set('model', model);   
      return this.render(modalName, {
        into: 'application',
        outlet: 'modal'
      });
    },

    closeModal: function() {
      return this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    },

    rollback: function(model) {
      console.log('>> ApplicationRoute rollbackGoal', model);

      if (model.get('isNew')) {
        model.deleteRecord();     
      } else {
        model.rollback();
      }       

      this.send('closeModal');
    } 
  }  
});






