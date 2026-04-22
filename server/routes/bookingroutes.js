const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingcontroller');
const { authenticate }  = require('./auth');

// TODO: MAKE IT USER ONLY and create version for owner
/**
 * @swagger
 * booking/me:
 *   get:
 *     summary: User retrieves all their bookings which has slot and owner information
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
 *     summary: User cancels their booking. The slot becomes available again and a mailto URL is returned for notifying the owner.
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled. Response body is a `url` URL string for notifying the slot owner.
 *         content:
 *           application/json:
 *             schema: { type: string }
 *       403: { description: Forbidden – can only cancel your own bookings }
 *       404: { description: Booking not found }
 */
router.delete('/:bookingId', authenticate, BookingController.deleteBooking);

// ================== Swagger Schemas =======================

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         bookingId:  { type: string }
 *         title:      { type: string }
 *         date:       { type: string }
 *         startTime:  { type: string }
 *         endTime:    { type: string }
 *         ownerName:  { type: string }
 *         ownerEmail: { type: string }
 *         ownerPublicId: {type: string}
 */


module.exports = router;
