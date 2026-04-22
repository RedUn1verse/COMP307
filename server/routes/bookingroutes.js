const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingcontroller');
const { authenticate }  = require('./auth');

/**
 * @swagger
 * booking/me:
 *   get:
 *     summary: User retrieves all their bookings 
 *     tags: [Booking]
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
 * booking/{bookingId}:
 *   delete:
 *     summary: User cancels one of their bookings
 *     tags: [Booking]
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
 *         startTime:
 *           type: string
 *         endTime:
 *           type: string
 *         status:
 *           type: string
 *           description: State of the booking. Will be confirmed or unconfirmed
 *           example: unconfirmed
 *        
 *
 */


module.exports = router;
