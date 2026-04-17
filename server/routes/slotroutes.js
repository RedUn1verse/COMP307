const express = require('express');
const SlotController   = require('../controllers/slotcontroller');
const { authenticate } = require('./auth');
const router = express.Router();

/**
 * @swagger
 * /{owner_id}/slots:
 *   get:
 *     summary: Get all active unbooked slots for a specific owner
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
router.get('/:owner_id/slots', authenticate, SlotController.getAvailableByOwner);

/**
 * @swagger
 * /slots:
 *   post:
 *     summary: Owner creates a new booking slot
 *     tags: [Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         routerlication/json:
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
 *           routerlication/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *       403:
 *         description: Forbidden – owner role required
 */
router.post('/slots', (req, res) => {
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
 *           routerlication/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SlotWithBooking'
 *       403:
 *         description: Forbidden – owner role required
 */
router.get('/slots', (req, res) => { res.status(501).send("get all slots booked and unbboked"); });


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
 *         routerlication/json:
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
router.put('/slots/:slotId', (req, res) => { res.status(501).send("update a slot"); });


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
router.delete('/slots/:slotId', (req, res) => { res.status(501).send("delete a slot"); });

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
 *         routerlication/json:
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
router.post('/slots/:slotId/email', (req, res) => { res.status(501).send("owner send email to user"); });

module.exports = router;
