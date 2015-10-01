var { Tabs, Tab, Paper } = MUI

HomePage = React.createClass({
  render () {
    return (
      <Paper zDepth={1}>
        <DataPicker />
      </Paper>
    );
  }
})

DataPicker = React.createClass({
  renderTabs () {
    return App.contexts.map((context) => {
      return <Tab label={context} key={context}></Tab>
    })
  },
  render () {
    return (
      <Tabs>
        {this.renderTabs()}
      </Tabs>
    )
  }
})
