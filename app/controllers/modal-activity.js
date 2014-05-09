export default Ember.ObjectController.extend({
  actions: {
    update: function() {
    	// NOTE: avoid send() target naming conflict with the controller event
			return this.send('saveActivity', this.get('model'));    	
    },
  }
});