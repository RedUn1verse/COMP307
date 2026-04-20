const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path')
const { connectDB, getDB } = require('./db');
const userRoutes = require('./routes/userroutes');
const slotRoutes = require('./routes/slotroutes');
const bookingRoutes = require('./routes/bookingroutes');
const authRoutes = require('./routes/authroutes');
const proposalRoutes = require('./routes/proposalroutes');

// ================== App Config =======================

const hostname = 'winter2026-comp307-group09.cs.mcgill.ca';
const port = 3000;
const app = express();

app.use(express.json());

app.use('/user', userRoutes);
app.use('/slot', slotRoutes);
app.use('/booking', bookingRoutes);
app.use('/auth', authRoutes);
app.use('/proposal', proposalRoutes);



// ================== Swagger Config =======================
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking App',
      version: '1.0.0',
      description: '307 final project',
    },
  },
  apis: [
    path.join(__dirname, 'server.js'), 
    path.join(__dirname, 'routes', '*.js')
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ================== Test =======================

app.get('/api/test', (req, res) => {
  res.json({ message: 'test works' });
});

app.post('/api/users', async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const db = getDB();

      const result = await db.collection('users').insertOne({ name, email, password });

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// ================== Main =======================

async function startServer() {
  await connectDB();

  app.listen(port, () => {
    console.log(`Running on port ${port}`);
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log(`Docs available at http://${hostname}:${port}/api-docs`);
  });

}

startServer();
