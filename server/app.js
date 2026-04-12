const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// ================== App Config =======================

const hostname = '127.0.0.1';
const port = 3000;
const app = express();

// ================== App Config =======================

const authRoutes    = require('./routes/authroutes');
const bookingRoutes = require('./routes/bookingroutes');
const slotRoutes    = require('./routes/slotroutes');
const userRoutes = require('./routes/userroutes');

app.use('/auth',     authRoutes);
app.use('/bookings', bookingRoutes);
app.use('/',         slotRoutes);   
app.use('/users',    userRoutes);

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
  apis: ['app.js', './routes/*.js',], 
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
 *         ownerId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         isBooked:
 *           type: boolean
 *
 *     SlotWithBooking:
 *       allOf:
 *         - $ref: '#/components/schemas/Slot'
 *         - type: object
 *           properties:
 *             bookedBy:
 *               type: object
 *               nullable: true
 *               properties:
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *
 *     Booking:
 *       type: object
 *       properties:
 *         bookingId:
 *           type: string
 *         slotId:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         slot:
 *           $ref: '#/components/schemas/Slot'
 *
 */