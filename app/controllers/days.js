import dateHelper from 'appkit/utils/date';
import config from 'appkit/utils/config';

export default Ember.ArrayController.extend({
  needs: ['application'],
  // availableFundsVault: Ember.computed.alias('controllers.application.availableFundsVault'),
  // totalInvestmentsVault: Ember.computed.alias('controllers.application.totalInvestmentsVault'),
  // lastCheckInDateVault: Ember.computed.alias('controllers.application.lastCheckInDateVault'),
  
  checkedIn: function() {
    return this.get('controllers.application.lastCheckInDateVault') && 
      this.get('controllers.application.lastCheckInDateVault').get('value') === dateHelper.todayDate();
  }.property('controllers.application.lastCheckInDateVault'),

  sortProperties: ['date'],
  sortAscending: false,

  // A change in activity count will refresh activityData which refreshes the charts
  activities: null,
  goals: null,

  availableFundsData: function() {
    console.log('>> DaysController availableFundsData');

    if (!this.get('model.isLoaded')) {return;}

    return availableFundsSamples(this);
  }.property('activities.length'),

  totalAssetsData: function() {
    console.log('>> DaysController totalFundsData');

    if (!this.get('model.isLoaded')) {return;}

    return totalAssetsSamples(this);
  }.property('activities.length'),

});

function isRecentDay(day) {
  var startDate = moment().add('days', - config.RECENT_DAYS_COUNT).format('YYYY-MM-DD');  
  return day.get('date') >= startDate;
}


function availableFundsSamples(context) {
  return context.filter(isRecentDay).map(function(day) {
    return {
      date: day.get('date'),
      label: day.get('date'),
      value: day.get('availableFunds')
    };
  });
}

function totalAssetsSamples(context) {
  return context.filter(isRecentDay).map(function(day) {
    return {
      date: day.get('date'),
      label: day.get('date'),
      value: day.get('totalAssets')
    };
  });
}