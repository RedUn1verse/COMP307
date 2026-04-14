const express = require('express');
const UserController   = require('../controllers/usercontroller');
const { authenticate } = require('./auth');
const router = express.Router();
/**
 * @swagger
 * /users/active:
 *   get:
 *     summary: Get all registered users who have at least one active unbooked slot
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users with active unbooked slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Joseph Vibyhal
 *                   email: 
 *                     type: string
 *                     example: jvibihal@mail.mcgill.ca
 *                   role: 
 *                      type: string
 *                      example: owner
 *                   public_id:
 *                      type: string
 *                      example: 3b185b17-7682-4f9e-990a-a1b415a20822
 *       401:
 *         description: Unauthorized
 */
router.get('/active', authenticate, UserController.getActiveOwners);



/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:   { type: string }
 *                 email:  { type: string }
 *                 role:   { type: string }
 *       401:
 *         description: Unauthorized
 */
router.get('/me',authenticate, UserController.getMe);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user or owner
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:     { type: string, example: Alice Smith }
 *               email:    { type: string, example: alice@example.com }
 *               password: { type: string, example: secret123 }
 *               role:     { type: string, enum: [user, owner] }
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation errors
 *       409:
 *         description: Email already registered
 */
router.post('/',  (req, res) => { res.status(501).send("create a user")});


module.exports = router;