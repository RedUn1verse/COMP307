const express = require('express');
const meetingController = require('../controllers/meetingcontroller');
const { authenticate } = require('./auth');
const router = express.Router();

/**
 * @swagger
 * meeting/{userId}/create:
 *   post:
 *     summary: User sends a meeting request to an owner
 *     description: >
 *       Creates meeting request and returns a mailto: URL the caller can
 *       open to email the owner. The request also shows up on the owner's
 *       dashboard until they accept or decline.
 *     tags: [Meeting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ownerEmail, message, date, startTime, endTime]
 *             properties:
 *               ownerEmail: { type: string, example: "carol@mcgill.ca" }
 *               title:    { type: string, example: "Midterm viewing" }
 *               message:    {type: string, example: "Could we chat about the midterm" }
 *               date:       { type: string, example: "2026-05-12" }
 *               startTime: { type: string, example: "10:00" }
 *               endTime:   { type: string, example: "10:30" }
 *     responses:
 *       201:
 *         description: Request created; response includes 'url' URL to open mailto:.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MeetingRequestUserView'
 *                 - type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "mailto:carol@mcgill.ca?subject=New+meeting+request+from+Alice+Smith&body=..."
 *       400: { description: Validation error or self-request }
 *       404: { description: Owner not found }
 */
router.post('/:userId/create', meetingController.create);

/**
 * @swagger
 * meeting/{userId}:
 *   get:
 *     summary: A user/owner will view their meeting requests. The user sees the requests they sent. An owner sees the requests they received 
 *     tags: [Meeting]
 *     responses:
 *       200: 
 *          description: List of the caller's requests
 */
router.get('/:userId', meetingController.getMe);


/**
 * @swagger
 * meeting/{userId}/{meetingId}/decline:
 *   post:
 *     summary: Owner declines a meeting request and emails the user about. The meeting request is removed from both the user and owner's information
 *     tags: [Meeting]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: 
 *         description: Rejects meeting; Response includes 'url' to open mailto:.
 *         content:
 *           application/json:
 *             schema:             
 *              type: object
 *              properties:
 *                  url:
 *                      type: string
 *                      format: uri
 *                      example: "mailto:carol@mcgill.ca?subject=New+meeting+request+from+Alice+Smith&body=..."
 *       409: { description: Meeting already declined }
 *       403: 
 *          description: Only the addressed owner can decline
 *          content:
 *              application/json:
 *              schema: { $ref: '#/components/schemas/Error' }
 *      
 *              
 */
router.post('/:userId/:meetingId/decline', meetingController.decline);


/**
 * @swagger
 * meeting/{userId}/{meetingId}/accept:
 *   post:
 *     summary: Owner accepts a meeting request and emails the user about. The meeting request is removed from both the user and owner's information. A booking is added to both the user and owner's information
 *     tags: [Meeting]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: 
 *         description: Accepts meeting; Response includes 'url' to open mailto:.
 *         content:
 *           application/json:
 *             schema:             
 *              type: object
 *              properties:
 *                  url:
 *                      type: string
 *                      format: uri
 *                      example: "mailto:carol@mcgill.ca?subject=New+meeting+request+from+Alice+Smith&body=..."
 *       403: 
 *          description: Only the addressed owner can accept
 *          content:
 *              application/json:
 *              schema: { $ref: '#/components/schemas/Error' }
 *       404: 
 *          description: MeetingId not found
 *          content:
 *              application/json:
 *              schema: { $ref: '#/components/schemas/Error' }
 *              
 */
router.post('/:userId/:meetingId/accept', meetingController.accept);


/**
 * @swagger
 * components:
 *   schemas:
 *     MeetingRequestUserView:
 *       type: object
 *       description: Meeting Request Detail.
 *       properties:
 *         ownerName:   { type: string, example: "Caroline Owner" }
 *         date:       { type: string, example: "2026-05-04" }
 *         startTime: { type: string, example: "09:00" }
 *         endTime:   { type: string, example: "10:00" }
 *         description: { type: string, example: "Midterm viewing" }
 *         message: { type: string, example: "Could we chat about the midterm" }
 */

module.exports = router;