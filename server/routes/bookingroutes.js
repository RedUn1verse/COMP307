const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingcontroller');
const { authenticate }  = require('./auth');
/**
 * @swagger
 * /bookings/book:
 *   post:
 *     summary: User books an available slot
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         routerlication/json:
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
 *           routerlication/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Slot is already booked or unavailable
 *       403:
 *         description: Forbidden – user role required
 *       404:
 *         description: Slot not found
 */
router.post('/book', (req, res) => { res.status(501).send("books a slot"); });
 
/**
 * @swagger
 * /bookings/me:
 *   get:
 *     summary: User retrieves all their bookings (both confirmed and unconfirmed)
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of the authenticated user's bookings
 *         content:
 *           routerlication/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Forbidden – user role required
 */
router.get('/me', authenticate, BookingController.getMyBookings);

 
/**
 * @swagger
 * bookings/{bookingId}:
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
router.delete('/:bookingId', (req, res) => { res.status(501).send("delete a booking"); });

// ================== Swagger Schemas =======================

/**
 * @swagger
 * components:

 *   schemas: 
 *
 *     Booking:
 *       type: object
 *       properties:
 *         owner_name:
 *           type: string
 *         date:
 *           type: string
 *         start_time:
 *           type: string
 *         end_time:
 *           type: string
 *         status:
 *           type: string
 *           description: State of the booking. Will be confirmed or unconfirmed
 *           example: unconfirmed
 *        
 *
 */


module.exports = router;
