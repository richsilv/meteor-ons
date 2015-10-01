Template.datasets.onCreated(function () {
  this.contexts = new ReactiveVar([])
  this.subscribe('datasets', () => {
    this.contexts.set(_.uniq(_.pluck(Datasets.find({}, { fields: { context: 1 } }).fetch(), 'context')))
  })
})

Template.datasets.onRendered(function () {
  this.$('[data-toggle="tab"]').tab()
})

Template.datasets.helpers({
  contexts: function () {
    return Template.instance().contexts.get()
  },
  datasets: function (context) {
    return Datasets.find({ context, geographicalHierarchy: "2014WARDH" })
  }
})

Template.datasets.events({
  'click [data-action="download"]:not([checked])': function (evt, tpl) {
    console.log('hello!')
    Meteor.call('ons/download', this._id, (err, res) => {
      if (err) return console.error(err)
      console.log(res)
    })
  }
})
