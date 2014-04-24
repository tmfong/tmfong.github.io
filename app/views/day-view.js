

export default Ember.View.extend({
  init: function() {
    this._super();
    this.set('isEditing', this.get('isNew'));
  },
  templateName: 'day-view',

  earningsStyle: function() {
    return currencyButtonCssClass(this.get('earnings'));
  }.property('availableFunds'),
  availableFundsStyle: function() {
    return currencyButtonCssClass(this.get('availableFunds'));
  }.property('availableFunds'),
  expensesStyle: function() {
    return currencyButtonCssClass(this.get('expenses'));
  }.property('expenses'),

  actions: {

    addingNote: function() {
      // this.sendAction('newNoteAction', day); 
      console.log('>> dayView addingNote', this.get('context'));
      this.get('controller').send('addingNote', this.get('context'));

      // this.get('context').toggleProperty('isNewNote');
    },   
  }
});


