import Resolver from 'ember/resolver';

var App = Ember.Application.extend({
  // LOG_ACTIVE_GENERATION: true,
  LOG_MODULE_RESOLVER: true,
  // LOG_TRANSITIONS: true,
  // // Extremely detailed logging, highlighting every internal
  // // step made while transitioning into a route, including
  // // `beforeModel`, `model`, and `afterModel` hooks, and
  // // information about redirects and aborted transitions  
  // LOG_TRANSITIONS_INTERNAL: true,
  // LOG_VIEW_LOOKUPS: true,
  modulePrefix: 'appkit', // TODO: loaded via config
  Resolver: Resolver['default'],


  VAULT_TYPE_DAY: 'day', 
  VAULT_LAST_CHECK_IN_DATE: 'lastCheckInDate',
  GAME_GOAL_INVESTMENT_LEVELS: [100, 200, 500, 1000, 10000],
  GAME_GOAL_1ST_ACTION_REWARD: 0.1,
  GAME_GOAL_ACTION_REWARD: 0.1,
  GAME_GOAL_MAX_ACTION_REWARD: 0.3,
  GAME_GOAL_DAILY_PENALTY: -0.3,
  ACTION_INTERVAL_IN_HOURS: 6,
  DATE_NEVER: '2000-01-01',
  DATE_FUTURE: '2099-01-01',
});

Ember.RSVP.configure('onerror', function(error) {
  // ensure unhandled promises raise awareness.
  // may result in false negatives, but visibility is more important
  if (error instanceof Error) {
    Ember.Logger.assert(false, error);
    Ember.Logger.error(error.stack);
  }
});


export default App;
