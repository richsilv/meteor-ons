Template.topbar.events({
  'click [data-action="get-datasets"]' () {
    Meteor.call('ons/refreshDatasets', err => {
      if (err) toastr.error(err.reason)
      else toastr.success('Datasets updated')
    })
  }
})
