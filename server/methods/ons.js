var url = Npm.require('url')
var fs = Npm.require('fs')
var unzip = Meteor.npmRequire('unzip2')
var csv = Meteor.npmRequire('csv')
var onsHost = 'data.ons.gov.uk'
var onsApiRoot = 'ons/api/data/'

ONS = {
  get (endpoint, options) {
    options = options || {}
    options.apikey = Meteor.settings.apiKey
    var urlObj = url.parse(endpoint, true)
    _.extend(urlObj, {
      protocol: 'http',
      host: onsHost,
    })
    _.extend(urlObj.query, options)
    urlObj.pathname = onsApiRoot + urlObj.pathname
    var thisUrl = url.format(urlObj)
    return new Promise((resolve, reject) => {
      HTTP.get(thisUrl, {}, (err, res) => {
        if (err) return reject(err)
        resolve(res.data.ons)
      })
    })
  },

  saveFile (filename, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, JSON.stringify(data), err => {
        if (err) return reject(err)
        resolve(true)
      })
    })
  },

  storeDatasets (data) {
    data.datasetList.contexts.context.forEach(context => {
      context.datasets.dataset.forEach(dataset => {
        dataset.context = context.contextName
        dataset = ONS.reorgDataset(ONS.cleanObject(dataset))
        Datasets.upsert({ id: dataset.id }, dataset)
      })
    })
    console.log('datasets stored')
  },

  cleanObject (data) {
    var newObj = {}
    for (key in data) {
      let newKey = typeof key === 'number' ? key : key.replace('.', '_').replace('$', 'val')
      let val = data[key]
      if (typeof val === 'object') val = ONS.cleanObject(val)
      newObj[newKey] = val
    }
    return newObj
  },

  reorgDataset (dataset) {
    dataset.names = _.reduce(dataset.names.name, (newNames, name) => {
      newNames[name['@xml_lang']] = name.val
      return newNames
    }, {})
    dataset.urls = _.reduce(dataset.urls.url, (newUrls, url) => {
      newUrls[url['@representation']] = url.href
      return newUrls
    }, {})
    return dataset
  },

  zipParse (uri, options) {
    options = options || {}
    options.apikey = Meteor.settings.apiKey
    var urlObj = url.parse(uri, true)
    _.extend(urlObj, {
      protocol: 'http',
      // host: onsHost,
      method: 'GET'
    })
    console.log(urlObj)
    // _.extend(urlObj.query, options)
    // urlObj.pathname = onsApiRoot + urlObj.pathname
    return new Promise((resolve, reject) => {
      var req = http.request(options, function(res) {
        res
          .pipe(unzip.Parse())
          .on('entry', function (entry) {
            var fileName = entry.path
            if (fileName.match(/.csv$/)) {
              entry.pipe(csv.parse({
                columns: true
              }, (err, output) => {
                if (err) return reject(err)
                resolve(output)
              }))
            } else {
              entry.autodrain()
            }
          })
      })
    })
  },

  logErrors (err) { throw new Meteor.Error(err) }
}

Meteor.methods({
  'ons/download': function (id) {
    var dataset = Datasets.findOne(id)
    if (!dataset) throw new Meteor.Error(`Cannot find dataset ${id}`)
    return ONS.get(dataset.urls.json)
  },
  'ons/refreshDatasets': function () {
    Datasets.remove({})
    ONS.get('datasets.json').then(ONS.storeDatasets).catch(ONS.logErrors)
  }
})
