const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path')

// ================== App Config =======================

const hostname = '127.0.0.1';
const port = 3000;
const app = express();

// ================== App Config =======================

const authRoutes    = require('./routes/authroutes');
const bookingRoutes = require('./routes/bookingroutes');
const slotRoutes    = require('./routes/slotroutes');
const userRoutes = require('./routes/userroutes');
const proposalRoutes = require('./routes/proposalroutes');

app.use('/auth',     authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/',         slotRoutes);   
app.use('/users',    userRoutes);
app.use('/proposals', proposalRoutes);

// ================== Swagger Config =======================
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'A simple Express API',
    },
  },
  apis: [
    path.join(__dirname, 'app.js'), 
    path.join(__dirname, 'routes', '*.js')
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// =========================================

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log(`Docs available at http://${hostname}:${port}/api-docs`);
});

/**
 * @swagger
 * /:
 *  get:
 *      summary: Returns a test message
 *      responses:
 *          200:
 *          description: Successful response
 */
app.get('/', (req, res) => {
    res.send('Hello World TEST99');
});



// ================== Swagger Schemas =======================

/**
 * @swagger
 * components:

 *   schemas:
 *     Slot:
 *       type: object
 *       properties:
 *         slotId:
 *           type: string
 *         date:
 *           type: string
 *         start_time:
 *           type: string
 *         end_time:
 *           type: string
 *
 *        
 *
 */