export default Ember.View.extend({
  init: function() {
    this._super();
    this.get('context').set('isEditing', this.get('context').get('isNew'));
  },  
  templateName: 'note-view',

  actions: {
    editing: function() {
      console.log('>> NoteView action editing');      
      this.get('context').toggleProperty('isEditing');   
      // return false;
    }, 

    update: function(note) {
      this.get('context').toggleProperty('isEditing');          

      this.get('controller').send('updateNote', this.get('context'));         
    },

    confirmingCancel: function() {
      this.get('context').toggleProperty('isConfirmingCancel'); 
    },
    confirmedCancel: function(note) {    
      if (note.get('isNew')) {
        // Going to delete this newly created record
        note.set('body', '');
        this.sendAction('updateNoteAction', note);
      } else if (note.get('isDirty')) {
        note.rollback();
      }
      this.get('context').toggleProperty('isConfirmingCancel'); 
      this.get('context').toggleProperty('isEditing');            
    },  
    nevermind: function() {
      this.get('context').toggleProperty('isConfirmingCancel');       
    },    
  }
});