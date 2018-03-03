var MongoClient = require('mongodb').MongoClient

var state = {
  database: null,
}

exports.connect = function(url, done) {
  if (state.database) return done()

  MongoClient.connect(url, function(err, database) {
    if (err) return done(err)
    state.database = database.db('learn');;
    done()
  })
}

exports.get = function() {
  return state.database;
}

exports.close = function(done) {
  if (state.database) {
    state.database.close(function(err, result) {
      state.database = null
      state.mode = null
      done(err)
    })
  }
}