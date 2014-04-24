var showdown = new Showdown.converter();
export default Ember.Handlebars.makeBoundHelper(function(input) {
  return new Handlebars.SafeString(showdown.makeHtml(input));
});