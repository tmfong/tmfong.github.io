// type: finance
App.Vault = DS.Model.extend({
  type: DS.attr(),
  key: DS.attr(),
  value: DS.attr(),
  editedAt: DS.attr()
});

 export default App.Vault;