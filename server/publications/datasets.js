Meteor.publish('datasets', function () {
  return Datasets.find()
})
