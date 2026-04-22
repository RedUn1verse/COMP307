const express = require('express');
const SlotController   = require('../controllers/slotcontroller');
const { authenticate } = require('./auth');
const router = express.Router();



/**
 * @swagger
 * slot/{userId}/createR:
 *   post:
 *     summary: Owner creates one or more recurring slots (weekly, starts private)
 *     description: Same as create, but also takes a `reccurence` integer. Creates slots, each 7 days apart starting from `date`.
 *     tags: [Slot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, startTime, endTime, reccurence]
 *             properties:
 *               title:      { type: string }
 *               date:       { type: string, example: "2026-05-04" }
 *               startTime:  { type: string, example: "09:00" }
 *               endTime:    { type: string, example: "10:00" }
 *               reccurence:
 *                 type: integer
 *                 description: Number of weekly occurrences to create (must be >= 1)
 *                 example: 4
 *     responses:
 *       201:
 *         description: Slots created successfully (not active)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Slot' }
 *       400: { description: Invalid input }
 *       403: { description: Forbidden – owner role required }
 */
router.post('/:userId/createR', SlotController.createR);


/**
 * @swagger
 * slot/{userId}/create:
 *   post:
 *     summary: Owner creates a new booking slot (starts private)
 *     tags: [Slot]
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
router.post('/:userId/create', SlotController.create);

/**
 * @swagger
 * slot/{userId}/owned:
 *   get:
 *     summary: Owner retrieves all their slots (private + active); each slot includes its booking (if any).
 *     tags: [Slot]
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
router.get('/:userId/owned', SlotController.getOwned);

/**
 * @swagger
 * slot/{userId}/{slotId}/activate:
 *   put:
 *     summary: Owner makes one of their slots active (public)
 *     tags: [Slot]
 *     responses:
 *       200: { description: Slot activated }
 *       403: { description: Forbidden – not the owner }
 *       404: { description: Slot not found }
 */
router.put('/:userId/:slotId/activate', SlotController.activate);


/**
 * @swagger
 * slot/{publicId}:
 *   get:
 *     summary: A user can find all active  && unbooked slots for a specific owner
 *     tags: [Slot]
 *     parameters:
 *       - in: path
 *         name: publicId
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
router.get('/:publicId', SlotController.getAvailableByOwner);


/**
 * @swagger
 * slot/{userId}/{slotId}:
 *   delete:
 *     summary: Owner deletes a slot. If a/many user(s) had booked it, a mailto notification URL is returned.
 *     tags: [Slot]
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
router.delete('/:userId/:slotId', SlotController.deleteSlot);

/**
 * @swagger
 * slot/{userId}/{slotId}/book:
 *   post:
 *     summary: Authenticated user or owner books another owner's active unbooked slot
 *     tags: [Slot]
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Slot booked successfully. Returns a bookingId, a slot object and a url. The url is a mailto url to notify the owner of the slot }
 *       400: { description: Already booked or booking your own slot }
 *       403: { description: Slot is private }
 *       404: { description: Slot not found }
 */
router.post('/:userId/:slotId/book', SlotController.book);

/**
 * @swagger
 * slot/{userId}/{slotId}/email:
 *   post:
 *     summary: Used for an Authenticated user to composes an email to the owner of a slot. Returns a mailto URL with the to field addressed to the owner.
 *     tags: [Slot]
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: A "url" mailto URL string addressed to the slot's owner.
 *       404: { description: Slot or owner not found }
 */
router.post('/:userId/:slotId/email', SlotController.emailOwner);


module.exports = router;
