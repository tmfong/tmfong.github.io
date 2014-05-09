App.Activity = DS.Model.extend({
  dailyGoal: DS.belongsTo('dailyGoal'),
  sequence: DS.attr(),  
  body: DS.attr(),
  reward: DS.attr(),
  actionAt: DS.attr(),
  createdAt: DS.attr(),

  // Calculate the duration in minutes
  duration: function(){
  	// console.log('>> App.Activity duration refreshing for dailyGoal', 
  	// 	this.get('dailyGoal').get('id'));
  	if (!this.get('actionAt') || !this.get('createdAt')) {
  		return 0;
  	}  	
    var actionAt = moment(this.get('actionAt'));
    var createdAt = moment(this.get('createdAt'));
    var duration = createdAt.diff(actionAt, 'minutes');
    // A simple check-in is counted as 1 minute
    return	duration === 0 ? 1 : duration;
  }.property('actionAt', 'createdAt'),
  // durationChanged: function() {
  // 	Ember.run.once(this, 'duration');
  // }.property('actionAt', 'createdAt')  
});

export default App.Activity;