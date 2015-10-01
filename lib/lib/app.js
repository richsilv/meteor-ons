// Global app settings
App = {}

Meteor.startup(() => {
  App.contexts = _.uniq(_.pluck(Datasets.find({}, {fields: {context: 1}}).fetch(), 'context'))
})
