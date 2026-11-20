require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Convert malformed JSON into a controlled 400 response. Never expose
// parser, Prisma, bcrypt, or other internal error details to API clients.
app.use((error, req, res, next) => {
  if (error && (error.type === 'entity.parse.failed' || error.status === 400)) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Invalid request body' }
    });
  }

  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    const code = error.code || 'BAD_REQUEST';
    const message = error.message || 'Invalid request';
    return res.status(error.status).json({ error: { code, message } });
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on ${port}`));
