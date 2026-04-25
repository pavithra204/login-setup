const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('⚠️  WARNING: JWT_SECRET is not set! Using default value.');
  console.error('   Set JWT_SECRET in .env file before deploying to production.');
}

function authenticate(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('auth_token');
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

module.exports = { authenticate, JWT_SECRET };
