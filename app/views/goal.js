export default Ember.View.extend({
  init: function() {
    this._super();
    this.set('isEditing', this.get('isNew'));
    this.set('isChanging', this.get('isEditing'));    
  },
  templateName: 'goal-record',  
  actions: {
    editing: function() {
      this.toggleProperty('isEditing');
      this.toggleProperty('isChanging');       
    },    
    update: function(goal) {
      this.toggleProperty('isEditing');      
      this.toggleProperty('isChanging');

      this.sendAction('updateAction', goal); 
    },   

    investing: function() {
      this.toggleProperty('isInvesting');             
      this.toggleProperty('isChanging');       
    },
    invest: function(goal) {
      this.toggleProperty('isInvesting');      
      this.toggleProperty('isChanging');

      // Make sure we don't use string 
      var investment = parseInt(goal.get('investment'), 10);
      goal.set('investment', investment);

      this.sendAction('investAction', goal); 
    }, 
  }
});
