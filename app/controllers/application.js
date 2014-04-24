import dateHelper from 'appkit/utils/date';

export default Ember.Controller.extend({
  isEditing: false,

  checkedIn: function() {
    return this.get('lastCheckInDateVault') && 
      this.get('lastCheckInDateVault').get('value') === dateHelper.todayDate();
  }.property('lastCheckInDateVault'),

  totalInvestmentsStyle: function() {
    return currencyButtonCssClass(this.get('lastCheckInDay').get('totalInvestments'));
  }.property('lastCheckInDay.totalInvestments'),

  totalAssetsStyle: function() {
    return currencyButtonCssClass(this.get('lastCheckInDay').get('totalAssets'));
  }.property('lastCheckInDay.totalAssets'),

  // availableFundsVault: null,    
  // totalInvestmentsVault: null,  
  lastCheckInDateVault: null,  
  lastCheckInDay: null,      
});