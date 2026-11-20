const port = Number.parseInt(process.env.PORT, 10) || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'development-only-change-me';
const parsedMaxArticles = Number.parseInt(process.env.MAX_ARTICLES, 10);
const maxArticles = Number.isFinite(parsedMaxArticles) && parsedMaxArticles > 0
  ? parsedMaxArticles
  : 50;

module.exports = { port, nodeEnv, jwtSecret, maxArticles };
