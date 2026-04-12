// ================== AUTH =======================
// TODO: Implement login and Authorization
// TODO: Implement bearer token and middleware
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); 
const DUMMY_SECRET_TOKEN = process.env.DUMMY_SECRET_TOKEN;

/**
 * @swagger
 * /auth/login:
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
   
   const user = {userId: 12345}
   const accessToken = jwt.sign(user, DUMMY_SECRET_TOKEN)
   res.json({accessToken: accessToken})
});

module.exports = router;