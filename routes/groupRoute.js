const express = require("express");
const router = express.Router();
const {
  createGroup,
  createDiscussion,
  joinGroup,
  leaveGroup,
  likeDiscussion,
  Createcomment,
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
router.post("/groups/leave/:groupId", leaveGroup);
router.post("/groups/members/:groupId", checkMembership);
router.delete("/groups/deleteGroup/:groupId", deleteGroup);

// Discussion routes
router.post("/discussions/createDiscussion", createDiscussion);
router.post("/discussions/likeDiscussion", likeDiscussion);
router.post("/discussions/Createcomment/:discussionId", Createcomment);
router.delete("/groups/deleteDiscussion/:discussionId", deleteDiscussion);

// Comment routes
router.post("/discussions/:discussionId/comments/:commentId/like", likeComment);
router.put("/discussions/:discussionId/comments/:commentId/edit", editComment);
router.delete(
  "/discussions/delete/:discussionId/comments/:commentId",
  deleteComment
);

// GETS
// New routes
router.get("/groups/getAllGroups/", getAllGroups);
router.get("/groups/getGroupBySlug/:slug", getGroupBySlug);
router.get("/groups/getDiscussionsByGroup/:groupId", getDiscussionsByGroup);

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
