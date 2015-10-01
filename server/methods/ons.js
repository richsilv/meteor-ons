var url = Npm.require('url')
var fs = Npm.require('fs')
var onsHost = 'data.ons.gov.uk'
var onsApiRoot = 'ons/api/data/'

getONS = function (endpoint, options) {
  options = options || {}
  options.apikey = Meteor.settings.apiKey
  var urlObj = url.parse(endpoint, true)
  Object.assign(urlObj, {
    protocol: 'http',
    host: onsHost,
  })
  Object.assigne(urlObj.query, options)
  urlObj.pathname = onsApiRoot + urlObj.pathname
  var thisUrl = url.format(urlObj)
  console.log(urlObj, thisUrl)
  return new Promise((resolve, reject) => {
    HTTP.get(thisUrl, {}, (err, res) => {
      if (err) return reject(err)
      resolve(res.data.ons)
    })
  })
}

saveFile = function (filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data), err => {
      if (err) return reject(err)
      resolve(true)
    })
  })
}

storeDatasets = function (data) {
  data.datasetList.contexts.context.forEach(context => {
    context.datasets.dataset.forEach(dataset => {
      dataset.context = context.contextName
      dataset = reorgDataset(cleanObject(dataset))
      Datasets.upsert({ id: dataset.id }, dataset)
    })
  })
  console.log('datasets stored')
}

function cleanObject (data){
  var newObj = {}
  for (key in data) {
    let newKey = typeof key === 'number' ? key : key.replace('.', '_').replace('$', 'val')
    let val = data[key]
    if (typeof val === 'object') val = cleanObject(val)
    newObj[newKey] = val
  }
  return newObj
}

function reorgDataset (dataset) {
  dataset.names = _.reduce(dataset.names.name, (newNames, name) => {
    newNames[name['@xml_lang']] = name.val
    return newNames
  }, {})
  dataset.urls = _.reduce(dataset.urls.url, (newUrls, url) => {
    newUrls[url['@representation']] = url.href
    return newUrls
  }, {})
  return dataset
}

logErrors = err => console.log(err)

Meteor.methods({
  'ons/download': function (id) {
    var dataset = Datasets.findOne(id)
    if (!dataset) throw new Meteor.Error(`Cannot find dataset ${id}`)
    return getONS(dataset.urls.json)
  }
})
