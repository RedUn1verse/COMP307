const express = require('express');
const ProposalController = require('../controllers/proposalcontroller');
const { authenticate }   = require('./auth');
const router = express.Router();


/**
 * @swagger
 * /proposals/me:
 *   get:
 *     summary: Authenticated user retrieves proposals they were invited to
 *     description: Response does not show vote and the invite list. Each option has myVote so the user can tell which they voted for.
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
 *       description: Proposal as seen by an invited user. Does not expose vote counts or the invite list.
 *       properties:
 *         proposalId:       { type: string, example: "p1" }
 *         title:            { type: string, example: "307 final" }
 *         owner_name:       { type: string, example: "Carol Owner" }
 *         options:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProposalOptionUserView' }
 */



module.exports = router;