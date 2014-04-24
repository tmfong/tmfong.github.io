export default Ember.View.extend({
  templateName: 'daily-goal-view',  

  actions: {
    addingActivity: function(activity) {
      this.get('context').set('clockStarts', new Date());
      this.get('context').set('newActivity', activity);

      this.get('context').toggleProperty('isAddingActivity');
    }, 

    addActivity: function(newActivity) {
      console.log('>> dailyGoalView addActivity', newActivity);      
      this.get('context').toggleProperty('isAddingActivity');

      var clockStarts = this.get('context').get('clockStarts');
      var duration = moment().diff(clockStarts, 'minutes');


      // Ember Data
      if (!newActivity.get('body').trim()){
        if (duration < 1)  {
          newActivity.set('body', 'Check-in');
        } else {
          newActivity.set('body', moment().from(clockStarts, true));
        }
      }  

      this.get('controller').send('saveActivity', newActivity);         
    },     
  }
});