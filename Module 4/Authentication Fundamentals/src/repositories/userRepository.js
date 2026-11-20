const prisma = require('../db/prisma');

// Keep all Prisma access in this repository.
async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser({ name, email, passwordHash }) {
  return prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true }
  });
}

module.exports = { findByEmail, createUser };
