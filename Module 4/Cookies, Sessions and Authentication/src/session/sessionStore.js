const crypto = require('node:crypto');

const sessions = new Map();
const ttl = Number(process.env.SESSION_TTL_MS || 3600000);

function create(userId) {
  const id = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + ttl;
  sessions.set(id, { userId, expiresAt });
  return { id, expiresAt };
}

function get(id) {
  if (typeof id !== 'string' || !id) return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }
  return { userId: session.userId, expiresAt: session.expiresAt };
}

function destroy(id) {
  if (typeof id === 'string' && id) sessions.delete(id);
}

module.exports = { create, get, destroy };
