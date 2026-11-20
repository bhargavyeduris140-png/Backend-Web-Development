const sessionStore = require('../session/sessionStore');

module.exports = function requireSession(req, res, next) {
  const sessionId = req.signedCookies && req.signedCookies.sid;
  const session = sessionStore.get(sessionId);

  if (!session) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    });
  }

  req.session = session;
  req.userId = session.userId;
  return next();
};
