// ******************* GLOBAL SETTINGS *****************************

// SUBSCRIPTIONS

FlowRouter.subscriptions = function() {
  // this.register('mySub', Meteor.subscribe('mySubName'));
};

// TRIGGERS

FlowRouter.triggers.enter([
  // myEnterFunc
] /* , {
  only: ['myRoute'],
  except: ['myOtherRoute']
} */);

FlowRouter.triggers.exit([
  // myExitFunc
] /* , {
  only: ['myRoute'],
  except: ['myOtherRoute']
} */);

// ************************* ROUTES ********************************
FlowRouter.route('/', {
  name: 'home',
  triggersEnter: [],
  subscriptions: function(params, queryParams) {

  },
  action: function(params) {
    /* The key 'content' is now a function */
    ReactLayout.render(MainLayout, {
      content() {
        return <HomePage />;
      }
    });
  },
  triggersExit: []
});
