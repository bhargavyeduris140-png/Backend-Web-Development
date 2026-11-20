const repo = require('./../repository/postsRepo');
const AppError = require('./../utils/AppError');

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // a post may only be edited within 24h

exports.getAll = async () => repo.findAll();
exports.create = async ({ authorId, title, body }) => repo.insert({ authorId, title, body });

/**
 * Edit a post only when it exists, belongs to the current user, and is
 * still inside the 24-hour editing window. Complete every check before writing.
 */
exports.editPost = async (postId, userId, changes) => {
  const post = await repo.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.authorId !== userId) {
    throw new AppError('You can only edit your own post', 403);
  }

  if (Date.now() - post.createdAt > EDIT_WINDOW_MS) {
    throw new AppError('Post can no longer be edited', 403);
  }

  // Only allow editable fields; never let clients overwrite ownership or metadata.
  const editableChanges = {};
  if (typeof changes.title === 'string') editableChanges.title = changes.title;
  if (typeof changes.body === 'string') editableChanges.body = changes.body;

  return repo.update(postId, editableChanges);
};
