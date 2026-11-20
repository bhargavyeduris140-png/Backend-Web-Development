const postsRepo = require('./../repository/postsRepo');
const votesRepo = require('./../repository/votesRepo');
const AppError = require('./../utils/AppError');

/**
 * Cast one vote per user per post. Validate the post and existing vote
 * before inserting anything.
 */
exports.castVote = async (postId, userId) => {
  const post = await postsRepo.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const existingVote = await votesRepo.find(postId, userId);
  if (existingVote) {
    throw new AppError('You have already voted on this post', 409);
  }

  return votesRepo.insert(postId, userId);
};

exports.countFor = async (postId) => votesRepo.countByPost(postId);
