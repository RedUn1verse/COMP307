const express = require('express');
const SlotController   = require('../controllers/slotcontroller');
const { authenticate } = require('./auth');
const router = express.Router();


/**
 * @swagger
 * slot/create:
 *   post:
 *     summary: Owner creates a new booking slot (starts private)
 *     tags: [Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, startTime, endTime]
 *             properties:
 *               title:     { type: string }
 *               date:      { type: string }
 *               startTime: { type: string }
 *               endTime:   { type: string }
 *     responses:
 *       201: { description: Slot created successfully (private by default) }
 *       400: { description: Invalid input }
 *       403: { description: Forbidden – owner role required }
 */
router.post('/create', authenticate, SlotController.create);

/**
 * @swagger
 * slot/owned:
 *   get:
 *     summary: Owner retrieves all their slots (private + active); each slot includes its booking (if any).
 *     tags: [Slots]
 *     responses:
 *       200:
 *         description: List of all slots owned by the authenticated owner, with a `bookings` field attached where users have booked the slot.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   slotId:    {type: string }
 *                   title:     { type: string }
 *                   date:      { type: string }
 *                   startTime: { type: string }
 *                   endTime:   { type: string }
 *                   isPrivate: { type: boolean }
 *                   isBooked:  { type: boolean }
 *                   bookings:
 *                      type: array
 *                      items:
 *                          type: object
 *                          properties:
 *                              bookingId: { type: string }
 *                              userName:  { type: string, description: Name of the user who booked this slot }
 *                              userEmail: { type: string, description: Email of the user who booked this slot }
 *       403: { description: Forbidden – owner role required }
 */
router.get('/owned', authenticate, SlotController.getOwned);

/**
 * @swagger
 * slot/activate:
 *   put:
 *     summary: Owner makes one of their slots active (public)
 *     tags: [Slots]
 *     requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *              type: object
 *              required: [slotId]
 *              properties:
 *                  slotId:     { type: string }
 *     responses:
 *       200: { description: Slot activated }
 *       403: { description: Forbidden – not the owner }
 *       404: { description: Slot not found }
 */
router.put('/activate', authenticate, SlotController.activate);


/**
 * @swagger
 * slot/{ownerId}:
 *   get:
 *     summary: A user can find all active unbooked slots for a specific owner
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The publicId of the owner
 *         example: 3b185b17-7682-4f9e-990a-a1b415a20822
 *     responses:
 *       200:
 *         description: List of unbooked active slots for the owner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slot'
 *       404:
 *         description: Owner not found
 */
router.get('/:ownerId', SlotController.getAvailableByOwner);


/**
 * @swagger
 * slot/{slotId}:
 *   delete:
 *     summary: Owner deletes a slot. If a user had booked it, a mailto notification URL is returned.
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Slot deleted. url is a mailto link which will notify users if the slot is booked. }
 *       403: { description: Forbidden – not the owner }
 *       404: { description: Slot not found }
 */
router.delete('/:slotId', authenticate, SlotController.deleteSlot);

// /**
//  * @swagger
//  * /slot/{slotId}:
//  *   delete:
//  *     summary: Owner deletes a booking slot
//  *     tags: [Slots]
//  *     parameters:
//  *       - in: path
//  *         name: slotId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Slot deleted successfully
//  *       403:
//  *         description: Forbidden – owner role required
//  *       404:
//  *         description: Slot not found
//  */
// router.delete('/slots/:slotId', (req, res) => { res.status(501).send("delete a slot"); });

// /**
//  * @swagger
//  * /slots/{slotId}/email:
//  *   post:
//  *     summary: Owner sends an email to the user who booked a slot
//  *     tags: [Slots]
//  *     parameters:
//  *       - in: path
//  *         name: slotId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         routerlication/json:
//  *           schema:
//  *             type: object
//  *             required: [subject, body]
//  *             properties:
//  *               subject:
//  *                 type: string
//  *               body:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Email sent successfully
//  *       403:
//  *         description: Forbidden – owner role required
//  *       404:
//  *         description: Slot not found or no booking exists for this slot
//  */
// router.post('/slots/:slotId/email', (req, res) => { res.status(501).send("owner send email to user"); });

module.exports = router;
