var clearTable = function(store, tableName) {
  return store.find(tableName).then(
    function(result) {
      var array = result.get('content');
      for (var i = array.length - 1; i >= 0; i--) {
        array[i].deleteRecord();
        array[i].save();
      }
    }
  );  
};


var updateVault = function(item, value) {
  item.set('value', value);
  return item.save(); 
};



var newVault = function(store, type, key, value) {
  var obj = {
    type: type,
    key: key,
    value: value,
    editedAt: now()
  }
  var item = store.createRecord('vault', obj);
  item.save();
  return item;
};

var RECENT_DAYS_COUNT = 7;
var MAX_ACTIVITY_SEQUENCE = 3; // activitySeq: 0, 1, 2, 3

export default {
  clearTable: clearTable,
  updateVault: updateVault,
  newVault: newVault,
  // Constants
  RECENT_DAYS_COUNT: RECENT_DAYS_COUNT,
  MAX_ACTIVITY_SEQUENCE: MAX_ACTIVITY_SEQUENCE
};