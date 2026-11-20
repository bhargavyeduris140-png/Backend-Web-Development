const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const INVALID_CREDENTIALS = {
  error: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password'
  }
};

class AuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function requireNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateRegistration(input) {
  if (!input || typeof input !== 'object' ||
      !requireNonEmptyString(input.name) ||
      !requireNonEmptyString(input.email) ||
      !requireNonEmptyString(input.password)) {
    throw new AuthError(400, 'VALIDATION_ERROR', 'Name, email, and password are required');
  }
}

function validateLogin(input) {
  if (!input || typeof input !== 'object' ||
      !requireNonEmptyString(input.email) ||
      !requireNonEmptyString(input.password)) {
    throw new AuthError(400, 'VALIDATION_ERROR', 'Email and password are required');
  }
}

// Explicit allowlist: never serialize passwordHash or other internal fields.
function serializeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register(input) {
  validateRegistration(input);
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const costValue = Number(process.env.BCRYPT_COST || 12);
  const cost = Number.isInteger(costValue) && costValue >= 4 && costValue <= 14
    ? costValue
    : 12;

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, cost);
  try {
    const user = await userRepository.createUser({ name, email, passwordHash });
    return serializeUser(user);
  } catch (error) {
    // Handle a concurrent registration that wins the unique-email race.
    if (error && error.code === 'P2002') {
      throw new AuthError(409, 'EMAIL_ALREADY_EXISTS', 'Email already exists');
    }
    throw error;
  }
}

async function login(input) {
  validateLogin(input);
  const email = normalizeEmail(input.email);
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AuthError(401, 'INVALID_CREDENTIALS', INVALID_CREDENTIALS.error.message);
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!validPassword) {
    throw new AuthError(401, 'INVALID_CREDENTIALS', INVALID_CREDENTIALS.error.message);
  }

  return serializeUser(user);
}

module.exports = { register, login, AuthError, INVALID_CREDENTIALS };
