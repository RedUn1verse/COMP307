const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');

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
