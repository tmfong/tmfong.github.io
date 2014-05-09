export default Ember.ObjectController.extend({
  actions: {
    update: function() {
    	// NOTE: avoid send() target naming conflict with the controller event
			return this.send('updateNote', this.get('model'));    	
    },

    confirmingCancel: function() {
      this.toggleProperty('isConfirmingCancel'); 
    },

    confirmedCancel: function() {  
			this.toggleProperty('isConfirmingCancel');      

			return this.send('rollback', this.get('model'));     
    },  

    nevermind: function() {
      this.toggleProperty('isConfirmingCancel');       
    },     
  }
});