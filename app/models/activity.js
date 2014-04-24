App.Activity = DS.Model.extend({
  dailyGoal: DS.belongsTo('dailyGoal'),
  body: DS.attr(),
  reward: DS.attr(),
  actionAt: DS.attr(),
  createdAt: DS.attr()
});

export default App.Activity;