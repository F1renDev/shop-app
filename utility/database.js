const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let db;

const mongoConnect = callback => {
  MongoClient.connect(
    `mongodb+srv://F1ren:qwe123@cluster0-lhqoo.mongodb.net/shop?retryWrites=true&w=majority`
  )
    .then(client => {
      //Connecting to a "shop" database
      db = client.db();
      console.log("Connected!");
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (db) {
    return db;
  }
  throw "No Database Found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
