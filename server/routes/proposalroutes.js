const express = require('express');
const ProposalController = require('../controllers/proposalcontroller');
const { authenticate }   = require('./auth');
const router = express.Router();


/**
 * @swagger
 * /proposals/me:
 *   get:
 *     summary: Authenticated user retrieves proposals they are invited to (no vote counts)
 *     tags: [Proposals]
 *     responses:
 *       200: { description: List of proposals the user may vote on }
 */
router.get('/me',authenticate, ProposalController.getUserProposals);


module.exports = router;