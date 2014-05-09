export default Ember.ObjectController.extend({
  actions: {
    update: function() {
      // NOTE: avoid send() target naming conflict with the controller event
      return this.send('updateGoal', this.get('model'));      
    },


    cancel: function() {  
      return this.send('rollback', this.get('model'));     
    },  

  }
});