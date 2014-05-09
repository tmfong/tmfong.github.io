import dateHelper from 'appkit/utils/date';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').find('note');
  },

  actions: {
    updatingNote: function(model) {
      console.log('>> NotesRoute updatingNote', model);   
      if (!model) {
        model = creatingNote(this.get('store'));        
      }
      this.send('openModal', 'modal-note', model);
    },

    updateNote: function(note) {
      console.log('>> ApplicationRoute update', note);

      note.set('editedAt', dateHelper.now());
      note.save();

      this.send('closeModal');   
    }  
  }
});

function creatingNote(store) {
  console.log('>> creatingNote');    
  var obj = {
    title: '',    
    tag: '',
    body: '',
    editedAt: dateHelper.now(),
    createdAt: dateHelper.now(),    
  }
  var note = store.createRecord('note', obj);
  return note;
}