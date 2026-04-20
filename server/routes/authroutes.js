// ================== AUTH =======================
// TODO: Implement login and Authorization
// TODO: Implement bearer token and middleware
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const DUMMY_SECRET_TOKEN = process.env.DUMMY_SECRET_TOKEN;
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: jackie.chen@mail.mcgill.ca }
 *               password: { type: string, example: password123 }
 *     responses:
 *       200:
 *         description: Returns a JWT 
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', (req, res) => {
   //TODO: change harcode user with req
   const user = {userId: 'u1'}
   const accessToken = jwt.sign(user, DUMMY_SECRET_TOKEN)
   res.json({accessToken: accessToken})
});

module.exports = router;
