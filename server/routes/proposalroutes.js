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
 */



module.exports = router;