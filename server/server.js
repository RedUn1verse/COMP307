const express = require('express');
const { connectDB } = require('./db');
const userRoutes = require('./routes/userroutes');
const slotRoutes = require('./routes/slotroutes');
const bookingRoutes = require('./routes/bookingroutes');
const authRoutes = require('./routes/authroutes')

const app = express();

app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'test works' });
});

app.use('/api', userRoutes);
app.use('/api', slotRoutes);
app.use('/api', bookingRoutes);
app.use('/api', authRoutes);

async function startServer() {
  await connectDB();

  app.listen(5000, () => {
    console.log('Running on port 5000');
  });
}

startServer();
