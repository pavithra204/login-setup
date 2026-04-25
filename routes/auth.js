const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const xss      = require('xss');
const db       = require('../database/db');
const { authenticate, JWT_SECRET } = require('../middleware/authMiddleware');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Helper: generate next auto-increment ID ──────────────────────────────────
function nextId() {
  const users = db.get('users').value();
  if (!users.length) return 1;
  return Math.max(...users.map(u => u.id)) + 1;
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Sanitize inputs to prevent XSS
    const sanitizedName = xss(String(name || '').trim());
    const sanitizedEmail = xss(String(email || '').trim().toLowerCase());

    if (!sanitizedName || !sanitizedEmail || !password)
      return res.status(400).json({ error: 'All fields are required.' });
    if (sanitizedName.length < 2)
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail))
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    // Duplicate check
    const exists = db.get('users').find({ email: sanitizedEmail }).value();
    if (exists)
      return res.status(409).json({ error: 'This email is already registered. Try logging in.' });

    const password_hash = await bcrypt.hash(password, 12);
    const id = nextId();
    const now = new Date().toISOString();

    const newUser = {
      id,
      name:          sanitizedName,
      email:         sanitizedEmail,
      password_hash,
      login_count:   0,
      last_login:    null,
      created_at:    now,
    };

    db.get('users').push(newUser).write();

    const token = jwt.sign({ id, email: sanitizedEmail, name: sanitizedName }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: 'Account created successfully!',
      user: { id, name: sanitizedName, email: sanitizedEmail },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const sanitizedEmail = xss(String(email || '').trim().toLowerCase());
    const user = db.get('users').find({ email: sanitizedEmail }).value();

    if (!user) {
      console.log(`[AUTH DEBUG] User not found: ${sanitizedEmail}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.log(`[AUTH DEBUG] Password mismatch for: ${sanitizedEmail}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log(`[AUTH DEBUG] Login successful for: ${sanitizedEmail}`);

    // Update login stats
    db.get('users')
      .find({ id: user.id })
      .assign({ login_count: user.login_count + 1, last_login: new Date().toISOString() })
      .write();

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    return res.json({
      message: 'Login successful!',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({ message: 'Logged out successfully.' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// ─── POST /api/auth/change-password ────────────────────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Current and new password are required.' });

    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });

    if (currentPassword === newPassword)
      return res.status(400).json({ error: 'New password must be different from current password.' });

    const user = db.get('users').find({ id: req.user.id }).value();
    if (!user)
      return res.status(404).json({ error: 'User not found.' });

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordValid)
      return res.status(401).json({ error: 'Current password is incorrect.' });

    // Hash new password and update
    const newHash = await bcrypt.hash(newPassword, 12);
    db.get('users')
      .find({ id: req.user.id })
      .assign({ password_hash: newHash })
      .write();

    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ─── POST /api/auth/delete-account ────────────────────────────────────────────
router.post('/delete-account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ error: 'Password required to delete account.' });

    const user = db.get('users').find({ id: req.user.id }).value();
    if (!user)
      return res.status(404).json({ error: 'User not found.' });

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid)
      return res.status(401).json({ error: 'Password is incorrect.' });

    // Delete user
    db.get('users')
      .remove({ id: req.user.id })
      .write();

    // Clear cookie
    res.clearCookie('auth_token');

    return res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
