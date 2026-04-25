const express = require('express');
const db      = require('../database/db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────
router.get('/stats', authenticate, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const createdAt      = new Date(user.created_at);
  const now            = new Date();
  const daysSinceMember = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  const memberSince = createdAt.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const lastLogin = user.last_login
    ? new Date(user.last_login).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'First session';

  return res.json({
    stats: {
      accountId:   `#${String(user.id).padStart(6, '0')}`,
      name:        user.name,
      email:       user.email,
      memberSince,
      memberDays:  daysSinceMember === 0 ? 'Today' : `${daysSinceMember} day${daysSinceMember !== 1 ? 's' : ''}`,
      loginCount:  user.login_count,
      lastLogin,
    },
  });
});

module.exports = router;
