// Author: Christina Vuong
// Student ID: 260929195
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingcontroller');
const { authenticate }  = require('./auth');

// TODO: MAKE IT USER ONLY and create version for owner
/**
 * @swagger
 * booking/{userId}:
 *   get:
 *     summary: User retrieves all their bookings which has slot and owner information
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
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
router.get('/:userId', BookingController.getMyBookings);
/**
 * @swagger
 * booking/{userId}/{bookingId}:
 *   delete:
 *     summary: User cancels their booking. The slot becomes available again and a mailto URL is returned for notifying the owner.
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: userId
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
router.delete('/:userId/:bookingId', BookingController.deleteBooking);

/**
 * @swagger
 * booking/{userId}/{bookingId}/email:
 *   post:
 *     summary: Slot owner composes an email to the user who booked the slot. Returns a mailto URL.
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: A 'url' mailto URL string addressed to the booked user.
 *         content:
 *           application/json:
 *             schema: { type: string }
 *       403: { description: Forbidden – not the slot owner }
 *       404: { description: Booking, slot, or booked user not found }
 */
router.post('/:userId/:bookingId/email', BookingController.emailBookedUser);



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
