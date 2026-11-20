const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../db/prisma');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');

const router = express.Router();
const cookieName = 'sid';

function cookieOptions() {
  return {
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: Number(process.env.SESSION_TTL_MS || 3600000),
  };
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function invalidCredentials(res) {
  return res.status(401).json({
    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
  });
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || !email.trim() ||
        typeof password !== 'string' || !password) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Email and password are required' },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return invalidCredentials(res);

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return invalidCredentials(res);

    const session = sessionStore.create(user.id);
    res.cookie(cookieName, session.id, cookieOptions());
    return res.status(200).json({ user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      sessionStore.destroy(req.signedCookies.sid);
      res.clearCookie(cookieName, cookieOptions());
      return res.status(401).json({
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
      });
    }
    return res.status(200).json({ user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res, next) => {
  try {
    const sessionId = req.signedCookies && req.signedCookies.sid;
    if (sessionId) sessionStore.destroy(sessionId);
    res.clearCookie(cookieName, cookieOptions());
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
