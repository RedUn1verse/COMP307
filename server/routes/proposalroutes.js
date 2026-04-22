const express = require('express');
const ProposalController = require('../controllers/proposalcontroller');
const { authenticate }   = require('./auth');
const router = express.Router();
//TODO: role verification

/**
 * @swagger
 * proposal/{userId}:
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
router.get('/:userId',ProposalController.getUserProposals);

/**
 * @swagger
 * proposal/{userId}/owned:
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
router.get('/:userId/owned', ProposalController.getOwnerProposals);



 /** 
* @swagger
 * proposal/{userId}/create:
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
router.post('/:userId/create', ProposalController.create);

router.post('/test/:proposalId', ProposalController.test)

/**
 * @swagger
 * proposal/{userId}/{proposalId}/selectR:
 *   post:
 *     summary: Owner selects the option they want to book
 *     description: Closes the proposal, creates a new booking for all invited users and sends the owner a notificaton
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
 *           schema: { $ref: '#/components/schemas/ProposalSelectRRequest' }
 *     responses:
 *       200:
 *         description: Proposal closed and bookings created for invited users. Returns a 'url' mailto to send the owner a notification to themselves
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  url:
 *                      type: string
 *                      format: uri
 *                      example:  "mailto:carol@mcgill.ca?subject=New+meeting+request+from+Alice+Smith&body=..."
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
router.post('/:userId/:proposalId/selectR', ProposalController.selectR)

/**
 * @swagger
 * proposal/{userId}/{proposalId}/select:
 *   post:
 *     summary: Owner selects the option they want to book
 *     description: Closes the proposal, creates a new booking for all invited users and sends the owner a notificaton
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
 *         description: Proposal closed and bookings created for invited users. Returns a 'url' mailto to send the owner a notification to themselves
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  url:
 *                      type: string
 *                      format: uri
 *                      example:  "mailto:carol@mcgill.ca?subject=New+meeting+request+from+Alice+Smith&body=..."
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
router.post('/:userId/:proposalId/select', ProposalController.select);

/**
 * @swagger
 * proposal/{userId}/{proposalId}/vote:
 *   post:
 *     summary: Invited user casts their single vote for one or more options
 *     description: A user may vote only once per proposal. Subsequent vote requests from the same user are rejected with 400. A user may include multiple optionIds in this single call.
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
 *           schema: { $ref: '#/components/schemas/ProposalVoteRequest' }
 *     responses:
 *       200:
 *         description: Vote recorded; updated proposal as seen by the user
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProposalUserView' }
 *       400:
 *         description: Empty optionIds, unknown optionId, or unknown proposal
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 * 
 */
router.post('/:userId/:proposalId/vote', ProposalController.vote);



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
 *             required: [date, startTime, endTime]
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
 * 
 *     ProposalSelectRRequest:
 *       type: object
 *       required: [optionId, reccurence]
 *       properties:
 *         optionId:
 *           type: string
 *           example: "p1-opt-a"
 *         reccurence:
 *           type: string
 *           description: Must be a number equal or bigger
 *           example: "1"
 * 
 *     ProposalVoteRequest:
 *       type: object
 *       required: [optionIds]
 *       properties:
 *         optionIds:
 *           type: array
 *           description: One or more optionId to vote for.
 *           items: { type: string, example: "p1-opt-a" }
 * 
 *     Error:
 *        type: object
 *        properties:
 *          error: { type: string }
 * 
 *     Message:
 *        type: object
 *        properties:
 *          msg: { type: string }
 */



module.exports = router;