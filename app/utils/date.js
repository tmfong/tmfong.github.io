export default {
	todayDate: function () {
	  return window.moment(new Date()).format('YYYY-MM-DD');
	},

	now: function () {
	  return window.moment().format();
	}
	
};