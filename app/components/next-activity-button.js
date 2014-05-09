import config from 'appkit/utils/config';

export default Ember.Component.extend({
  activity: null,

  cssClass: function() {
    return style(this.get('activity').get('sequence'));
  }.property('activity.sequence'),
  
  click: function() {
  	this.sendAction('action', this.get('activity'));
  },
});

function style(sequence) {
  if (sequence > config.MAX_ACTIVITY_SEQUENCE) {
    sequence = config.MAX_ACTIVITY_SEQUENCE;
  }
	return 'btn btn-default btn-sm btn-activity-'+sequence;
};