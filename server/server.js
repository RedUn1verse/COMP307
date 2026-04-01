const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const client = new MongoClient('mongodb://localhost:27017');

let db;

async function connectDB() {
	await client.connect();
  	db = client.db('comp307');
  	console.log('MongoDB connected');
}

connectDB();

app.get('/api/test', (req, res) => {
  res.json({ message: "If you see this the test was successful" });
});

app.post('/api/users', async (req, res) => {
  	const { email, password } = req.body;

  	const result = await db.collection('users').insertOne({ name, email });

  	res.json(result);
});

app.use(express.static('public'));

app.listen(5000, () => {
  	console.log('Running on port 5000');
});
