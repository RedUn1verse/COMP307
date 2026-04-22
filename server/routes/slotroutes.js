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
 * slot/{owner_id}:
 *   get:
 *     summary: A user can find all active unbooked slots for a specific owner
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: owner_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The public_id of the owner
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
router.get('/:owner_id', authenticate, SlotController.getAvailableByOwner);




/**
 * @swagger
 * slot/owned:
 *   get:
 *     summary: Owner retrieves all their slots, private and active
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all slots owned by the authenticated owner
 *         content:
 *           routerlication/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SlotWithBooking'
 *       403:
 *         description: Forbidden – owner role required
 */
router.get('/slots', (req, res) => { res.status(501).send("get all slots private and active"); });


// /**
//  * @swagger
//  * /slot/{slotId}:
//  *   put:
//  *     summary: Owner updates a slot's details
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
//  *             properties:
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               startTime:
//  *                 type: string
//  *                 format: date-time
//  *               endTime:
//  *                 type: string
//  *                 format: date-time
//  *     responses:
//  *       200:
//  *         description: Slot updated successfully
//  *       403:
//  *         description: Forbidden – owner role required
//  *       404:
//  *         description: Slot not found
//  */
// router.put('/slots/:slotId', (req, res) => { res.status(501).send("update a slot"); });


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
