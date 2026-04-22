// ================== AUTH =======================
// TODO: Implement login and Authorization
// TODO: Implement bearer token and middleware

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
router.post('/login', (req, res) => {
   try {
      const { email, password } = req.body;

      if (!email || !password) {
         return res.status(400).json({ error: 'Email and password are required' });
      }

      if (!DUMMY_SECRET_TOKEN) {
         console.error('DUMMY_SECRET_TOKEN not set in environment variables');
         return res.status(500).json({ error: 'Server configuration error' });
      }

      // For now, accept any McGill email/password combo
      // TODO: Implement real user validation from database
      const isOwner = email.endsWith('@mcgill.ca') && !email.includes('@mail.');
      const userId = isOwner ? 'o1' : 'u1';

      const user = { userId };
      const accessToken = jwt.sign(user, DUMMY_SECRET_TOKEN);
      
      res.json({ 
         accessToken: accessToken,
         userId: userId,
         email: email
      });
   } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
   }
});


// // --------------- Testing Purpose ---------- TO REMOVE
// router.post('/login', (req, res) => {
//    //TODO: change harcode user with req
//    const user = {userId: 'o1'}
//    const accessToken = jwt.sign(user, DUMMY_SECRET_TOKEN)
//    res.json({accessToken: accessToken})
// });

module.exports = router;
