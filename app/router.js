var Router = Ember.Router.extend();

Router.map(function() {
  this.resource('days', {path: '/days'});  	
  this.resource('notes', {path: '/notes'});
});

export default Router;