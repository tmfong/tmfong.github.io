var Router = Ember.Router.extend();

Router.map(function() {
  this.resource('days', {path: '/days'});  	
  this.resource('notes', {path: '/notes'});
  this.resource('goals', {path: '/goals'});  
});

export default Router;