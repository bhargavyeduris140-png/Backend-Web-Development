/**
 * Post repository: the private Map is the storage implementation.
 *
 * When Prisma replaces this Map, only this repository's data-access code and
 * configuration change. Its five exported methods keep the same return
 * contract, so service business rules, controllers, and routes stay unchanged.
 */
const initialPosts = [
  { id: 1, title: 'First post', body: 'Repository boundaries protect change.', authorId: 7 },
  { id: 2, title: 'Second post', body: 'Services should speak in domain language.', authorId: 8 },
];

const postsById = new Map(initialPosts.map((post) => [post.id, { ...post }]));
let nextId = Math.max(0, ...postsById.keys()) + 1;

function findAll() {
  return Array.from(postsById.values(), (post) => ({ ...post }));
}

function findById(id) {
  const post = postsById.get(Number(id));
  return post ? { ...post } : null;
}

function create(fields) {
  const record = { ...fields, id: nextId++ };
  postsById.set(record.id, record);
  return { ...record };
}

function update(id, patch = {}) {
  const numericId = Number(id);
  const current = postsById.get(numericId);
  if (!current) return null;

  const updated = { ...current, ...patch, id: numericId };
  postsById.set(numericId, updated);
  return { ...updated };
}

function remove(id) {
  return postsById.delete(Number(id));
}

module.exports = { findAll, findById, create, update, remove };
