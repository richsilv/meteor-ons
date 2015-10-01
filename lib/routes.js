FlowRouter.route('/ons', {
  name: 'ons',
  triggersEnter: [],
  subscriptions: function(params, queryParams) {

  },
  action: function(params, queryParams) {
    BlazeLayout.render('datasets')
  },
  triggersExit: []
});
