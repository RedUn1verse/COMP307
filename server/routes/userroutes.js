const express = require('express');
const UserController   = require('../controllers/usercontroller');
const { authenticate } = require('./auth');
const router = express.Router();
/**
 * @swagger
 * user/active:
 *   get:
 *     summary: Get all owners who have at least one active slot
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of owners with at least one active slot
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
 *                   job: 
 *                      type: string
 *                      example: Professor
 *                   publicId:
 *                      type: string
 *                      example: 3b185b17-7682-4f9e-990a-a1b415a20822
 *       401:
 *         description: Unauthorized
 */
router.get('/active', UserController.getActiveOwners);



/**
 * @swagger
 * user/{userId}:
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
router.get('/:userId', UserController.getMe);

/**
 * @swagger
 * user/create:
 *   post:
 *     summary: Register a new user or owner
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *             required: [name, email, password, job]
 *               
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
router.post('/create', UserController.createUser);

/**
 * @swagger
 * user/{userId}/mypublicId:
 *   get:
 *     summary: An authenticated owner can get their publicId to generate a url their active slot pages 
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Owner's publicID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicId:   { type: string }
 *       403:
 *          description: Is not an owner
 *       404:
 *         description: User does not exist
 */
router.get('/:userId/myPublicId', UserController.getMyPublicId);


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       description: Information about a User.
 *       properties:
 *         name:   { type: string, example: "Alice Smith" }
 *         email:       { type: string, example: "alicesmith@mcgill.ca" }
 *         job:   { type: string, example: "student", description: A job can be a student, a teacher or a TA}
 *      
 *     NewUser:
 *       type: object
 *       description: Properties needed for the creation of a new user.
 *       properties:
 *         name:   { type: string, example: "Alice Smith" }
 *         email: {type:string, example: "alicesmith@mail.mcgill.ca"}
 *         password: { type: string, example: secret123 }
 *         job: {type: string, example: Student, description: A job can be student, teacher, or TA}
 */

module.exports = router;
