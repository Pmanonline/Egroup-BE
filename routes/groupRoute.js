const express = require("express");
const router = express.Router();
const {
  createGroup,
  createDiscussion,
  joinGroup,
  likeDiscussion,
  commentDiscussion,
  likeComment,
  editComment,
  deleteComment,
  getAllDiscussions,
  getDiscussionBySlug,
  getDiscussionLikes,
  getDiscussionComments,
  getCommentLikes,
  getAllGroups,
  getGroupBySlug,
  checkMembership,
  getDiscussionsByGroup,
  deleteGroup,
  deleteDiscussion,
} = require("../controllers/groupController");

// Group routes
router.post("/groups/createGroup", createGroup);
router.post("/groups/join/:groupId", joinGroup);
router.delete("/groups/deleteGroup/:groupId", deleteGroup);
router.get("/groups/:groupId/members/:userId", checkMembership);

// Discussion routes
router.post("/discussions/createDiscussion", createDiscussion);
router.post("/discussions/commentDiscussion/:discussionId", commentDiscussion);
router.delete("/groups/deleteDiscussion/:discussionId", deleteDiscussion);
router.post("/discussions/:discussionId/likeDiscussion", likeDiscussion);

// Comment routes
router.post("/discussions/:discussionId/comments/:commentId/like", likeComment);
router.put("/discussions/:discussionId/comments/:commentId/edit", editComment);
router.delete(
  "/discussions/:discussionId/comments/:commentId/delete",
  deleteComment
);

// GETS
// New routes
router.get("/groups/getAllGroups/", getAllGroups);
router.get("/groups/getGroupBySlug/:slug", getGroupBySlug);
router.get("/groups/getDiscussionsByGroup/:slug", getDiscussionsByGroup);
router.get("/discussions/getAllDiscussions", getAllDiscussions);
router.get("/discussions/getDiscussionBySlug/:slug", getDiscussionBySlug);
router.get("/discussions/getDiscussionLikes/:discussionId", getDiscussionLikes);
router.get(
  "/discussions/getDiscussionComments/:discussionId",
  getDiscussionComments
);
router.get(
  "/discussions/getCommentLikes/:discussionId/comment/:commentId ",
  getCommentLikes
);
module.exports = router;
