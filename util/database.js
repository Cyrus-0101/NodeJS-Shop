const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;


let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb+srv://cyrus:Y1B97SO21fuMmiI7@cluster0-xp4l4.mongodb.net/shop?retryWrites=true&w=majority'
  )
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      callback(client);
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};
const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No Database Found';
};

exports.mongoConnect = mongoConnect;

exports.getDb = getDb;
