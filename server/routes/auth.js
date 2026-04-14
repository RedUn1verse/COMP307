const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const DUMMY_SECRET_TOKEN = process.env.DUMMY_SECRET_TOKEN;

 
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  
  try {
    req.user = jwt.verify(token, DUMMY_SECRET_TOKEN);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
 
 
module.exports = {authenticate};
