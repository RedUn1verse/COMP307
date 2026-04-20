const express = require('express');
const ProposalController = require('../controllers/proposalcontroller');
const { authenticate }   = require('./auth');

const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const DUMMY_SECRET_TOKEN = process.env.DUMMY_SECRET_TOKEN;
const router = express.Router();
//TODO: role verification

/**
 * @swagger
 * /proposals/me:
 *   get:
 *     summary: Authenticated user retrieves proposals they were invited to
 *     description: Response does not show vote count. Each option has myVote so the user can tell which they voted for.
 *     tags: [Proposals]
 *     responses:
 *       200:
 *         description: List of proposals the user may see
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ProposalUserView' }
 */
router.get('/me',authenticate, ProposalController.getUserProposals);

/**
 * @swagger
 * /proposals/owned:
 *   get:
 *     summary: Owner retrieves all proposals they created, including vote tallies
 *     tags: [Proposals]
 *     responses:
 *       200:
 *         description: List of proposals owned by the authenticated owner, with vote counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ProposalOwnerView' }  
 */
router.get('/owned', authenticate, ProposalController.getOwnerProposals);



 /** 
* @swagger
 * /proposals/create:
 *   post:
 *     summary: Owner creates a proposal with slot options for a specific list of users
 *     tags: [Proposals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProposalCreateRequest' }
 *     responses:
 *       201:
 *         description: Proposal created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProposalOwnerView' }
 *       400:
 *         description: Validation error (missing title, empty userIds/options, unknown user, or option missing date/time fields)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized – missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Forbidden – owner role required
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/create', authenticate, ProposalController.create);


/**
 * @swagger
 * /proposals/{proposalId}/select:
 *   post:
 *     summary: Owner selects the option they want to book
 *     description: Closes the proposal, creates a new booking from the chosen option, creates a confirmed booking for the owner, and creates an unconfirmed booking for every invited user.
 *     tags: [Proposals]
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProposalSelectRequest' }
 *     responses:
 *       200:
 *         description: Proposal closed and bookings created for owner and invited users.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       403:
 *         description: Forbidden – only the proposal's owner may select
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Proposal not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:proposalId/select', authenticate, ProposalController.select);




// --------------- Testing Purpose ---------- TO REMOVE
router.post('/login', (req, res) => {
   //TODO: change harcode user with req
   const user = {userId: 'o1'}
   const accessToken = jwt.sign(user, DUMMY_SECRET_TOKEN)
   res.json({accessToken: accessToken})
});




/**
 * @swagger
 * components:
 *   schemas:
 *     ProposalOptionUserView:
 *       type: object
 *       description: Options as seen by an invited user (no vote counts).
 *       properties:
 *         optionId:   { type: string, example: "p1-opt-a" }
 *         date:       { type: string, example: "2026-05-04" }
 *         startTime: { type: string, example: "09:00" }
 *         endTime:   { type: string, example: "10:00" }
 *         myVote:
 *           type: boolean
 *           description: Whether the authenticated user voted for this option.
 * 
 *     ProposalUserView:
 *       type: object
 *       description: Proposal as seen by an invited user. Does not expose vote counts.
 *       properties:
 *         proposalId:       { type: string, example: "p1" }
 *         title:            { type: string, example: "307 final" }
 *         ownerName:       { type: string, example: "Carol Owner" }
 *         options:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProposalOptionUserView' }
 * 
 *     ProposalOptionOwnerView:
 *       type: object
 *       description: Options as seen by the owner (includes vote count).
 *       properties:
 *         date:       { type: string, example: "2026-05-04" }
 *         startTime: { type: string, example: "09:00" }
 *         endTime:   { type: string, example: "10:00" }
 *         voteCount: { type: integer, example: 2 }
 *         
 * 
 *     ProposalOwnerView:
 *       type: object
 *       description: Proposal as seen by the owner including vote count and the invite list.
 *       properties:
 *         proposalId:       { type: string, example: "p1" }
 *         title:            { type: string, example: "345 final" }
 *         invitedUsers:
 *           type: array
 *           description: Names of the invited users (the specific list who can see and vote on this proposal).
 *           items: { type: string, example: "Alice Smith" }
 *         options:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProposalOptionOwnerView' }
 * 
 *     ProposalCreateRequest:
 *       type: object
 *       required: [title, userIds, options]
 *       properties:
 *         title:
 *           type: string
 *           example: "#345 Final Pick a Time"
 *         userNames:
 *           type: array
 *           description: The specific list of invited users who can see and vote on this proposal.
 *           minItems: 1
 *           items: { type: string, example: "u1" }
 *         options:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required: [date, start_time, end_time]
 *             properties:
 *               date:       { type: string, example: "2026-05-04" }
 *               startTime: { type: string, example: "09:00" }
 *               endTime:   { type: string, example: "10:00" }
 * 
 *     ProposalSelectRequest:
 *       type: object
 *       required: [optionId]
 *       properties:
 *         optionId:
 *           type: string
 *           example: "p1-opt-a"
 *     Error:
 *        type: object
 *        properties:
 *          error: { type: string }
 */



module.exports = router;