const express = require('express');
const router = express.Router();
const UserController = require('../controllers/usercontroller');

/**
 * @swagger
 * auth/login:
 *   post:
 *     summary: Log in and receive the userId
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
 *         description: Returns a userId string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', UserController.login);





// // --------------- Testing Purpose ---------- TO REMOVE
// router.post('/login', (req, res) => {
//    //TODO: change harcode user with req
//    const user = {userId: 'o1'}
//    const accessToken = jwt.sign(user, DUMMY_SECRET_TOKEN)
//    res.json({accessToken: accessToken})
// });

module.exports = router;
