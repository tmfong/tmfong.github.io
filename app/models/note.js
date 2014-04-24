App.Note = DS.Model.extend({
  day: DS.belongsTo('day'), 
  title: DS.attr(),  
  body: DS.attr(),
  tag: DS.attr(),  
  // tags: DS.hasMany('tag'),  
  editedAt: DS.attr()
});

export default App.Note;