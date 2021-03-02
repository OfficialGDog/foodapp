const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = "mongodb+srv://garethdavieslive:9Zg7bYHojQaGaWq9@cluster0.ljkyp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let _db;


module.exports = {
  connect(callback) {
    MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {
      _db = client.db("sightings");
      return callback(err);
    });
  },
  
  getDb() {
    return _db;
  }
};

