const { MongoClient } = require('mongodb');

//const client = new MongoClient('mongodb://localhost:27017');
const client = new MongoClient('mongodb://localhost:27018'); // I had to change the port for testing, uncomment the above line and comment this one out if you want to use the default port

let db;

async function connectDB() {
  await client.connect();
  db = client.db('comp307');
  console.log('db connected');
}

function getDB() {
  if (!db) {
    throw new Error("db no good");
  }
  return db;
}

module.exports = { connectDB, getDB };
