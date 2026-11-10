const DEFAULT_AVATAR = {
  url: 'https://cdn.aurora-profiles.dev/avatars/default.png',
  initials: '?',
  source: 'fallback',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(error) {
  if (!error) return false;

  // Timeouts and aborted requests are transient.
  if (error.name === 'AbortError') return true;

  // HTTP 429 and 5xx responses may recover on a later attempt.
  if (Number.isInteger(error.status)) {
    return error.status === 429 || error.status >= 500;
  }

  // Errors without an HTTP status are treated as network failures.
  return !('status' in error);
}

async function withTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  let timer;

  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error('Operation timed out');
        error.name = 'AbortError';
        controller.abort();
        reject(error);
      }, timeoutMs);
    });

    return await Promise.race([
      Promise.resolve().then(() => operation(controller.signal)),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(operation, options = {}) {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 25;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new TypeError('maxAttempts must be a positive integer');
  }

  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const hasAttemptsRemaining = attempt < maxAttempts - 1;
      if (!hasAttemptsRemaining || !isRetryable(error)) {
        throw error;
      }

      await sleep(baseDelayMs * (2 ** attempt));
    }
  }

  throw lastError;
}

async function getProfileWithAvatar(authorId, avatarClient, options = {}) {
  const timeoutMs = options.timeoutMs ?? 200;
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 25;

  try {
    const avatar = await withRetry(
      () => withTimeout(
        signal => avatarClient.getAvatar(authorId, { signal }),
        timeoutMs,
      ),
      { maxAttempts, baseDelayMs },
    );

    return { authorId, avatar, degraded: false };
  } catch (_error) {
    // Avatar availability must not prevent the profile from being returned.
    return {
      authorId,
      avatar: { ...DEFAULT_AVATAR },
      degraded: true,
    };
  }
}

module.exports = {
  DEFAULT_AVATAR,
  sleep,
  isRetryable,
  withTimeout,
  withRetry,
  getProfileWithAvatar,
};
