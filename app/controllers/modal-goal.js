import dateHelper from 'appkit/utils/date'

export default Ember.ObjectController.extend({
  actions: {
    update: function() {
      // NOTE: avoid send() target naming conflict with the controller event
      return this.send('updateGoal', this.get('model'));      
    },
    cancel: function() {  
      return this.send('rollback', this.get('model'));     
    },  

    // Complete
    confirmingComplete: function() {
      this.toggleProperty('isConfirmingComplete'); 
    },
    complete: function() {
      var model = this.get('model');
      model.set('endDate', dateHelper.todayDate());      

      return this.send('updateGoal', model);      
    },
    nevermind: function() {
      this.toggleProperty('isConfirmingComplete');       
    }, 

  }
});