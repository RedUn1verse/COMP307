const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// ================== App Config =======================

const hostname = '127.0.0.1';
const port = 3000;
const app = express();

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
  apis: ['app.js'], 
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


// ================== AUTH =======================
// TODO: Implement login and Authorization
// TODO: Implement bearer token and middleware


// ================== Users =======================

/**
 * @swagger
 * /users/active:
 *   get:
 *     summary: Get all registered users who have at least one active booking
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users with active bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   activeBookingCount:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 */
app.get('/users/active', (req, res) => {
  res.status(501).send('users with active slots');
});

// TODO: Implement get user info (name, email? smt else?)


// ================== Owner =======================
/**
 * @swagger
 * /owners/{ownerId}/slots:
 *   get:
 *     summary: Get all available (unbooked) slots for a specific owner
 *     tags: [Owner]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the owner
 *     responses:
 *       200:
 *         description: List of available slots for the owner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slot'
 *       404:
 *         description: Owner not found
 */
app.get('/owners/:ownerId/slots', (req, res) => {
   res.status(501).send('owner unbook slots');
});

// ================== Owner Actions =======================
/**
 * @swagger
 * /slots:
 *   post:
 *     summary: Owner creates a new booking slot
 *     tags: [Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startTime, endTime]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Slot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *       403:
 *         description: Forbidden – owner role required
 */
app.post('/slots', (req, res) => {
  res.status(501).send('owner create slots');
});


/**
 * @swagger
 * /slots:
 *   get:
 *     summary: Owner retrieves all their slots (including booked ones)
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all slots owned by the authenticated owner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SlotWithBooking'
 *       403:
 *         description: Forbidden – owner role required
 */
app.get('/slots', (req, res) => { res.status(501).send("get all slots booked and unbboked"); });


/**
 * @swagger
 * /slots/{slotId}:
 *   put:
 *     summary: Owner updates a slot's details
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *       403:
 *         description: Forbidden – owner role required
 *       404:
 *         description: Slot not found
 */
app.put('/slots/:slotId', (req, res) => { res.status(501).send("update a slot"); });


/**
 * @swagger
 * /slots/{slotId}:
 *   delete:
 *     summary: Owner deletes a booking slot
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slot deleted successfully
 *       403:
 *         description: Forbidden – owner role required
 *       404:
 *         description: Slot not found
 */
app.delete('/slots/:slotId', (req, res) => { res.status(501).send("delete a slot"); });

/**
 * @swagger
 * /slots/{slotId}/email:
 *   post:
 *     summary: Owner sends an email to the user who booked a slot
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, body]
 *             properties:
 *               subject:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       403:
 *         description: Forbidden – owner role required
 *       404:
 *         description: Slot not found or no booking exists for this slot
 */
app.post('/slots/:slotId/email', (req, res) => { res.status(501).send("owner send email to user"); });


// ================== User Actions =======================

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: User books an available slot
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slotId]
 *             properties:
 *               slotId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Slot booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Slot is already booked or unavailable
 *       403:
 *         description: Forbidden – user role required
 *       404:
 *         description: Slot not found
 */
app.post('/bookings', (req, res) => { res.status(501).send("books a slot"); });
 
/**
 * @swagger
 * /bookings/me:
 *   get:
 *     summary: User retrieves all their bookings
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of the authenticated user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Forbidden – user role required
 */
app.get('/bookings/me', (req, res) => { res.status(501).send("get all the bookings of a user"); });
 
/**
 * @swagger
 * /bookings/{bookingId}:
 *   delete:
 *     summary: User cancels one of their bookings
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       403:
 *         description: Forbidden – can only cancel your own bookings
 *       404:
 *         description: Booking not found
 */
app.delete('/bookings/:bookingId', (req, res) => { res.status(501).send("delete a booking"); });


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