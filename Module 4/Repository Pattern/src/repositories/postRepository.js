const postStore = require('../data/postStore');

/**
 * Storage boundary for posts.
 * When Prisma replaces the in-memory store, only this repository's data-access
 * implementation and configuration change. The exported method contract and
 * service business rules remain unchanged.
 */

let postsById = new Map(postStore.posts.map((post) => [post.id, { ...post }]));
let nextId = Math.max(0, ...postsById.keys()) + 1;

function findAll() {
  return Array.from(postsById.values(), (post) => ({ ...post }));
}

function findById(id) {
  const post = postsById.get(Number(id));
  return post ? { ...post } : null;
}

function create(fields) {
  const record = { id: nextId++, ...fields };
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
