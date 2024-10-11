const Group = require("../models/groupSchema");
const Discussion = require("../models/discussionShema");
const UserModel = require("../models/userModel");
const slugify = require("slugify");

// Helper function to handle common error responses
const handleError = (res, statusCode, message) => {
  if (!res.headersSent) {
    res.status(statusCode).json({ error: message });
  } else {
    console.error("Headers already sent. Error:", message);
  }
};

const checkDocumentExists = (document, res, documentName) => {
  if (!document) {
    handleError(res, 404, `${documentName} not found`);
    return false;
  }
  return true;
};

const createGroup = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const group = new Group({ name, description, category });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().select(
      "name description category slug members"
    );
    res.status(200).json(groups);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getGroupBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await Group.findOne({ slug })
      .populate("category", "name slug")
      .populate("members", "name");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const groupData = {
      id: group._id,
      name: group.name,
      description: group.description,
      category: group.category,
      members: group.members.length,
      slug: group.slug,
    };

    res.status(200).json(groupData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getDiscussionsByGroup = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the group by slug first
    const group = await Group.findOne({ slug });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const discussions = await Discussion.find({ group: group._id })
      .populate("author", "name") // Populate the author's name if needed
      .sort({ createdAt: -1 }); // Sort discussions by newest first

    if (!discussions || discussions.length === 0) {
      return res
        .status(404)
        .json({ message: "No discussions found for this group" });
    }

    res.status(200).json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDiscussion = async (req, res) => {
  try {
    const { title, content, authorId, groupId } = req.body;

    // Log the incoming authorId
    console.log("Author ID received:", authorId);

    if (!title || !content || !authorId || !groupId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const author = await UserModel.findById(authorId);

    if (!author) {
      console.log(`Author with ID ${authorId} not found in the database.`);
      return res.status(404).json({ message: "Author not found" });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const discussion = new Discussion({
      title,
      content,
      slug,
      author: authorId,
      group: groupId,
    });

    await discussion.save();

    // Populate the author field before sending the response
    await discussion.populate("author", "username email _id");

    return res.status(201).json(discussion);
  } catch (error) {
    console.error("Error creating discussion:", error.message);
    return res
      .status(500)
      .json({ message: `Error creating discussion: ${error.message}` });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = await Group.findById(groupId);

    if (!checkDocumentExists(group, res, "Group")) return;

    if (group.members.includes(userId)) {
      return handleError(res, 400, "User already a member");
    }

    group.members.push(userId);
    await group.save();
    res.status(200).json({ message: "Joined group successfully" });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

// Route: GET /api/groups/:groupId/members/:userId
const checkMembership = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    // Validate that groupId and userId are provided
    if (!groupId || !userId) {
      return res.status(400).json({ message: "Missing groupId or userId" });
    }

    // Find the group by ID
    const group = await Group.findById(groupId);

    // If group is not found
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member of the group
    const isMember = group.members.includes(userId);

    // Return the result of the membership check
    return res.status(200).json({ isMember });
  } catch (error) {
    // Return a 500 status code for any server error
    return res.status(500).json({ message: error.message });
  }
};

const commentDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, authorId } = req.body;
    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    discussion.comments.push({ content, author: authorId });
    await discussion.save();
    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const likeDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { userId, action } = req.body;
    const discussion = await Discussion.findById(discussionId);
    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    const isLiked = discussion.likes.includes(userId);

    if (action === "like" && !isLiked) {
      discussion.likes.push(userId);
      await discussion.save();
      return res.status(200).json({
        message: "Liked discussion successfully",
        likes: discussion.likes,
      });
    } else if (action === "unlike" && isLiked) {
      discussion.likes = discussion.likes.filter(
        (id) => id.toString() !== userId
      );
      await discussion.save();
      return res.status(200).json({
        message: "Unliked discussion successfully",
        likes: discussion.likes,
      });
    } else {
      return res.status(400).json({
        message: "Invalid action or discussion already in desired state",
        likes: discussion.likes,
      });
    }
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const likeComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const { userId, action } = req.body;
    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    const comment = discussion.comments.id(commentId);

    if (!checkDocumentExists(comment, res, "Comment")) return;

    const isLiked = comment.likes.includes(userId);

    if (action === "like" && !isLiked) {
      comment.likes.push(userId);
      await discussion.save();
      return res.status(200).json({
        message: "Liked comment successfully",
        likes: comment.likes,
      });
    } else if (action === "unlike" && isLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
      await discussion.save();
      return res.status(200).json({
        message: "Unliked comment successfully",
        likes: comment.likes,
      });
    } else {
      return res.status(400).json({
        message: "Invalid action or comment already in desired state",
        likes: comment.likes,
      });
    }
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const editComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const { content, userId } = req.body;

    // Find the discussion by its ID
    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    // Find the specific comment by its ID
    const comment = discussion.comments.id(commentId);

    if (!checkDocumentExists(comment, res, "Comment")) return;

    // Update the content of the comment
    comment.content = content;

    // Save the updated discussion with the modified comment
    await discussion.save();

    // Populate the author details of the updated comment
    const updatedDiscussion = await Discussion.findById(discussionId).populate({
      path: "comments.author",
      select: "username email _id", // Select the necessary fields for the author
    });

    // Get the updated comment with populated author
    const updatedComment = updatedDiscussion.comments.id(commentId);

    // Send the updated comment back to the client
    res.status(200).json(updatedComment);
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const { userId } = req.body;

    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    // Find the comment
    const comment = discussion.comments.id(commentId);

    if (!checkDocumentExists(comment, res, "Comment")) return;

    // Fetch user data to check their role
    const user = await UserModel.findById(userId);

    // Check if user exists
    if (!user) {
      return handleError(res, 404, "User not found");
    }

    // Check if the user is the author of the comment or an admin
    if (comment.author.toString() !== userId && user.role !== "admin") {
      return handleError(res, 403, "Not authorized to delete this comment");
    }

    // Pull the comment from the discussion
    discussion.comments.pull(commentId);
    await discussion.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate("author", "username email _id") // Add more fields if needed
      .populate("group", "name");

    if (!discussions.length) {
      return res.status(404).json({ message: "No discussions found" });
    }

    res.status(200).json(discussions);
  } catch (error) {
    handleError(res, 500, error.message);
  }
};

const getDiscussionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const discussion = await Discussion.findOne({ slug })
      .populate("author", "username email _id")
      .populate("group", "name")
      .populate("comments.author", "username");

    if (!discussion) {
      return handleError(res, 404, "Discussion not found");
    }

    res.status(200).json(discussion);
  } catch (error) {
    handleError(res, 500, error.message);
  }
};

const getDiscussionLikes = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId).populate(
      "likes",
      "username"
    );

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    res.status(200).json(discussion.likes);
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const getDiscussionComments = async (req, res) => {
  try {
    const { discussionId } = req.params;

    // Find the discussion and populate the author's username in comments
    const discussion = await Discussion.findById(discussionId).populate(
      "comments.author",
      "username"
    );

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    // Get the comments and count
    const comments = discussion.comments;
    const commentCount = comments.length;

    res.status(200).json({
      comments,
      commentCount,
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const getCommentLikes = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    const comment = discussion.comments.id(commentId);

    if (!checkDocumentExists(comment, res, "Comment")) return;

    const likes = await UserModel.find(
      { _id: { $in: comment.likes } },
      "username"
    );
    res.status(200).json(likes);
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!checkDocumentExists(group, res, "Group")) return;
    await Discussion.deleteMany({ group: groupId });

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      message: "Group and associated discussions deleted successfully",
    });
  } catch (error) {
    handleError(res, 500, error.message);
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    // Delete the discussion
    await Discussion.findByIdAndDelete(discussionId);

    res.status(200).json({ message: "Discussion deleted successfully" });
  } catch (error) {
    handleError(res, 500, error.message);
  }
};

module.exports = {
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
};
