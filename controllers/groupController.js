// const Group = require("../models/groupSchema");
// const Discussion = require("../models/discussionShema");
// const UserModel = require("../models/userModel");
// const slugify = require("slugify");

// // Helper function to handle common error responses
// const handleError = (res, statusCode, message) => {
//   if (!res.headersSent) {
//     res.status(statusCode).json({ error: message });
//   } else {
//     console.error("Headers already sent. Error:", message);
//   }
// };

// const checkDocumentExists = (document, res, documentName) => {
//   if (!document) {
//     handleError(res, 404, `${documentName} not found`);
//     return false;
//   }
//   return true;
// };

// const createGroup = async (req, res) => {
//   try {
//     const { name, description, category } = req.body;
//     const group = new Group({ name, description, category });
//     await group.save();
//     res.status(201).json(group);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// const getAllGroups = async (req, res) => {
//   try {
//     const groups = await Group.find().select(
//       "name description category slug members"
//     );
//     res.status(200).json(groups);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// const getGroupBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const group = await Group.findOne({ slug })
//       .populate("category", "name slug")
//       .populate("members", "name");

//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     const groupData = {
//       id: group._id,
//       name: group.name,
//       description: group.description,
//       category: group.category,
//       members: group.members.length,
//       slug: group.slug,
//     };

//     res.status(200).json(groupData);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// const getDiscussionsByGroup = async (req, res) => {
//   try {
//     const { slug } = req.params;

//     // Find the group by slug first
//     const group = await Group.findOne({ slug });
//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     const discussions = await Discussion.find({ group: group._id })
//       .populate("author", "name") // Populate the author's name if needed
//       .sort({ createdAt: -1 }); // Sort discussions by newest first

//     if (!discussions || discussions.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No discussions found for this group" });
//     }

//     res.status(200).json(discussions);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const createDiscussion = async (req, res) => {
//   try {
//     const { title, content, authorId, groupId } = req.body;

//     // Log the incoming authorId
//     console.log("Author ID received:", authorId);

//     if (!title || !content || !authorId || !groupId) {
//       return res.status(400).json({ message: "All fields are required" });
//     }
//     const author = await UserModel.findById(authorId);

//     if (!author) {
//       console.log(`Author with ID ${authorId} not found in the database.`);
//       return res.status(404).json({ message: "Author not found" });
//     }

//     const slug = slugify(title, { lower: true, strict: true });

//     const discussion = new Discussion({
//       title,
//       content,
//       slug,
//       author: authorId,
//       group: groupId,
//     });

//     await discussion.save();

//     // Populate the author field before sending the response
//     await discussion.populate("author", "username email _id");

//     return res.status(201).json(discussion);
//   } catch (error) {
//     console.error("Error creating discussion:", error.message);
//     return res
//       .status(500)
//       .json({ message: `Error creating discussion: ${error.message}` });
//   }
// };

// // const joinGroup = async (req, res) => {
// //   try {
// //     const { groupId } = req.params;
// //     const { userId } = req.body;
// //     const group = await Group.findById(groupId);

// //     if (!checkDocumentExists(group, res, "Group")) return;

// //     if (group.members.includes(userId)) {
// //       return handleError(res, 400, "User already a member");
// //     }

// //     group.members.push(userId);
// //     await group.save();
// //     res.status(200).json({ message: "Joined group successfully" });
// //   } catch (error) {
// //     handleError(res, 400, error.message);
// //   }
// // };

// // Route: GET /api/groups/:groupId/members/:userId
// // const checkMembership = async (req, res) => {
// //   try {
// //     const { groupId, userId } = req.params;

// //     // Validate that groupId and userId are provided
// //     if (!groupId || !userId) {
// //       return res.status(400).json({ message: "Missing groupId or userId" });
// //     }

// //     // Find the group by ID
// //     const group = await Group.findById(groupId);

// //     // If group is not found
// //     if (!group) {
// //       return res.status(404).json({ message: "Group not found" });
// //     }

// //     // Check if user is a member of the group
// //     const isMember = group.members.includes(userId);

// //     // Return the result of the membership check
// //     return res.status(200).json({ isMember });
// //   } catch (error) {
// //     // Return a 500 status code for any server error
// //     return res.status(500).json({ message: error.message });
// //   }
// // };

// const joinGroup = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { email } = req.body;

//     // Find the user by email
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return handleError(res, 404, "User not found");
//     }

//     const group = await Group.findById(groupId);
//     if (!checkDocumentExists(group, res, "Group")) return;

//     // Check if the user is already a member of the group
//     if (group.members.includes(user._id)) {
//       return handleError(res, 400, "User already a member");
//     }

//     // Add the user's ObjectId to the group's members array
//     group.members.push(user._id);
//     await group.save();
//     res.status(200).json({ message: "Joined group successfully" });
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const checkMembership = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { email } = req.body;

//     // Validate that groupId and email are provided
//     if (!groupId || !email) {
//       return res.status(400).json({ message: "Missing groupId or email" });
//     }

//     // Find the user by email
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Find the group by ID
//     const group = await Group.findById(groupId);

//     // If group is not found
//     if (!group) {
//       return res.status(404).json({ message: "Group not found" });
//     }

//     // Check if user is a member of the group
//     const isMember = group.members.includes(user._id);

//     // Return the result of the membership check
//     return res.status(200).json({ isMember });
//   } catch (error) {
//     // Return a 500 status code for any server error
//     return res.status(500).json({ message: error.message });
//   }
// };

// const commentDiscussion = async (req, res) => {
//   try {
//     const { discussionId } = req.params;
//     const { content, authorId } = req.body;
//     const discussion = await Discussion.findById(discussionId);

//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     discussion.comments.push({ content, author: authorId });
//     await discussion.save();
//     res.status(201).json({ message: "Comment added successfully" });
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const likeDiscussion = async (req, res) => {
//   try {
//     const { discussionId } = req.params;
//     const { userId, action } = req.body;
//     const discussion = await Discussion.findById(discussionId);
//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     const isLiked = discussion.likes.includes(userId);

//     if (action === "like" && !isLiked) {
//       discussion.likes.push(userId);
//       await discussion.save();
//       return res.status(200).json({
//         message: "Liked discussion successfully",
//         likes: discussion.likes,
//       });
//     } else if (action === "unlike" && isLiked) {
//       discussion.likes = discussion.likes.filter(
//         (id) => id.toString() !== userId
//       );
//       await discussion.save();
//       return res.status(200).json({
//         message: "Unliked discussion successfully",
//         likes: discussion.likes,
//       });
//     } else {
//       return res.status(400).json({
//         message: "Invalid action or discussion already in desired state",
//         likes: discussion.likes,
//       });
//     }
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const likeComment = async (req, res) => {
//   try {
//     const { discussionId, commentId } = req.params;
//     const { userId, action } = req.body;
//     const discussion = await Discussion.findById(discussionId);

//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     const comment = discussion.comments.id(commentId);

//     if (!checkDocumentExists(comment, res, "Comment")) return;

//     const isLiked = comment.likes.includes(userId);

//     if (action === "like" && !isLiked) {
//       comment.likes.push(userId);
//       await discussion.save();
//       return res.status(200).json({
//         message: "Liked comment successfully",
//         likes: comment.likes,
//       });
//     } else if (action === "unlike" && isLiked) {
//       comment.likes = comment.likes.filter((id) => id.toString() !== userId);
//       await discussion.save();
//       return res.status(200).json({
//         message: "Unliked comment successfully",
//         likes: comment.likes,
//       });
//     } else {
//       return res.status(400).json({
//         message: "Invalid action or comment already in desired state",
//         likes: comment.likes,
//       });
//     }
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const editComment = async (req, res) => {
//   try {
//     const { discussionId, commentId } = req.params;
//     const { content, userId } = req.body;

//     // Find the discussion by its ID
//     const discussion = await Discussion.findById(discussionId);

//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     // Find the specific comment by its ID
//     const comment = discussion.comments.id(commentId);

//     if (!checkDocumentExists(comment, res, "Comment")) return;

//     // Update the content of the comment
//     comment.content = content;

//     // Save the updated discussion with the modified comment
//     await discussion.save();

//     // Populate the author details of the updated comment
//     const updatedDiscussion = await Discussion.findById(discussionId).populate({
//       path: "comments.author",
//       select: "username email _id", // Select the necessary fields for the author
//     });

//     // Get the updated comment with populated author
//     const updatedComment = updatedDiscussion.comments.id(commentId);

//     // Send the updated comment back to the client
//     res.status(200).json(updatedComment);
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const deleteComment = async (req, res) => {
//   try {
//     const { discussionId, commentId } = req.params;
//     const { userId } = req.body;

//     const discussion = await Discussion.findById(discussionId);

//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     // Find the comment
//     const comment = discussion.comments.id(commentId);

//     if (!checkDocumentExists(comment, res, "Comment")) return;

//     // Fetch user data to check their role
//     const user = await UserModel.findById(userId);

//     // Check if user exists
//     if (!user) {
//       return handleError(res, 404, "User not found");
//     }

//     // Check if the user is the author of the comment or an admin
//     if (comment.author.toString() !== userId && user.role !== "admin") {
//       return handleError(res, 403, "Not authorized to delete this comment");
//     }

//     // Pull the comment from the discussion
//     discussion.comments.pull(commentId);
//     await discussion.save();

//     res.status(200).json({ message: "Comment deleted successfully" });
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const getAllDiscussions = async (req, res) => {
//   try {
//     const discussions = await Discussion.find()
//       .populate("author", "username email _id") // Add more fields if needed
//       .populate("group", "name");

//     if (!discussions.length) {
//       return res.status(404).json({ message: "No discussions found" });
//     }

//     res.status(200).json(discussions);
//   } catch (error) {
//     handleError(res, 500, error.message);
//   }
// };

// const getDiscussionBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const discussion = await Discussion.findOne({ slug })
//       .populate("author", "username email _id")
//       .populate("group", "name")
//       .populate("comments.author", "username");

//     if (!discussion) {
//       return handleError(res, 404, "Discussion not found");
//     }

//     res.status(200).json(discussion);
//   } catch (error) {
//     handleError(res, 500, error.message);
//   }
// };

// const getDiscussionLikes = async (req, res) => {
//   try {
//     const { discussionId } = req.params;
//     const discussion = await Discussion.findById(discussionId).populate(
//       "likes",
//       "username"
//     );

//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     res.status(200).json(discussion.likes);
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const getDiscussionComments = async (req, res) => {
//   try {
//     const { discussionId } = req.params;

//     // Find the discussion and populate the author's username in comments
//     const discussion = await Discussion.findById(discussionId).populate(
//       "comments.author",
//       "username"
//     );

//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     // Get the comments and count
//     const comments = discussion.comments;
//     const commentCount = comments.length;

//     res.status(200).json({
//       comments,
//       commentCount,
//     });
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const getCommentLikes = async (req, res) => {
//   try {
//     const { discussionId, commentId } = req.params;
//     const discussion = await Discussion.findById(discussionId);

//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     const comment = discussion.comments.id(commentId);

//     if (!checkDocumentExists(comment, res, "Comment")) return;

//     const likes = await UserModel.find(
//       { _id: { $in: comment.likes } },
//       "username"
//     );
//     res.status(200).json(likes);
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };

// const deleteGroup = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const group = await Group.findById(groupId);

//     if (!checkDocumentExists(group, res, "Group")) return;
//     await Discussion.deleteMany({ group: groupId });

//     await Group.findByIdAndDelete(groupId);

//     res.status(200).json({
//       message: "Group and associated discussions deleted successfully",
//     });
//   } catch (error) {
//     handleError(res, 500, error.message);
//   }
// };

// const deleteDiscussion = async (req, res) => {
//   try {
//     const { discussionId } = req.params;
//     const discussion = await Discussion.findById(discussionId);

//     if (!checkDocumentExists(discussion, res, "Discussion")) return;

//     // Delete the discussion
//     await Discussion.findByIdAndDelete(discussionId);

//     res.status(200).json({ message: "Discussion deleted successfully" });
//   } catch (error) {
//     handleError(res, 500, error.message);
//   }
// };

// module.exports = {
//   createGroup,
//   createDiscussion,
//   joinGroup,
//   likeDiscussion,
//   commentDiscussion,
//   likeComment,
//   editComment,
//   deleteComment,
//   getAllDiscussions,
//   getDiscussionBySlug,
//   getDiscussionLikes,
//   getDiscussionComments,
//   getCommentLikes,
//   getAllGroups,
//   getGroupBySlug,
//   checkMembership,
//   getDiscussionsByGroup,
//   deleteGroup,
//   deleteDiscussion,
// };

// controllers/groupController.js

const Group = require("../models/groupSchema");
const Discussion = require("../models/discussionShema");
const UserModel = require("../models/userModel");
const slugify = require("slugify");
const mongoose = require("mongoose");
// Helper functions
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

// User helper function
const findUserByEmail = async (email) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("User not found");
  return user;
};

const getUserInfo = (req) => {
  if (!req.body.userInfo || !req.body.userInfo.user) {
    throw new Error("User information not provided");
  }

  const { user } = req.body.userInfo;
  console.log(user, "checking values of userInfo");
  return {
    id: user.id.toString(), // Convert to string to ensure consistency
    email: user.email,
    name: user.name,
    role: user.role || "user",
  };
};

// const createGroup = async (req, res) => {
//   try {
//     const { Groupname, description, category } = req.body;

//     const group = new Group({
//       Groupname,
//       description,
//       category,
//       creator: user,
//       members: [user], // Add creator as first member
//     });

//     await group.save();
//     res.status(201).json(group);
//   } catch (error) {
//     handleError(res, 400, error.message);
//   }
// };
const createGroup = async (req, res) => {
  try {
    const {
      Groupname,
      description,
      category,
      id: authId,
      email,
      name,
    } = req.body;

    // Add input validation
    if (!Groupname || !description || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if group with same name exists
    const existingGroup = await Group.findOne({ Groupname });
    if (existingGroup) {
      return res
        .status(400)
        .json({ message: "Group with this name already exists" });
    }

    const memberData = { id: authId, email, name };

    const group = new Group({
      Groupname,
      description,
      category,
      creator: memberData,
      members: [memberData],
    });

    const savedGroup = await group.save();

    // Return the slug in the response for frontend redirection
    res.status(201).json({
      ...savedGroup.toJSON(),
      slug: savedGroup.slug,
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(400).json({
      message: error.message || "Failed to create group",
    });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { id, email, name } = req.body;

    if (!id || !email) {
      return handleError(
        res,
        400,
        "ID and email are required to join the group"
      );
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return handleError(res, 404, "Group not found");
    }

    // Check if user is already a member
    const isMember = group.members.some((member) => member.email === email);
    if (isMember) {
      return handleError(res, 400, "User is already a member of this group");
    }

    // Add new member with extracted details
    group.members.push({
      id,
      email,
      name: name?.trim() || "Anonymous", // Default if no name is provided
    });

    await group.save();

    res.status(200).json({
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const checkMembership = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    // Validate that groupId and email are provided
    if (!groupId || !email) {
      return res.status(400).json({ message: "Missing groupId or email" });
    }

    // Find the group by ID
    const group = await Group.findById(groupId);

    // If group is not found
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user email exists in the group's members array
    const isMember = group.members.some((member) => member.email === email);
    // Return the result of the membership check
    return res.status(200).json({ isMember });
  } catch (error) {
    // Return a 500 status code for any server error
    return res.status(500).json({ message: error.message });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    if (!email) {
      return handleError(res, 400, "Email is required");
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return handleError(res, 404, "Group not found");
    }

    // Check if user is the creator
    if (group.creator.email === email) {
      return handleError(res, 400, "Group creator cannot leave the group");
    }

    // Remove user from members
    group.members = group.members.filter((member) => member.email !== email);
    await group.save();

    res.status(200).json({
      message: "Left group successfully",
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .select("Groupname description category slug members")
      .populate("members", "email name");

    res.status(200).json(groups);
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const getGroupBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await Group.findOne({ slug })
      .populate("category", "Groupname slug")
      .populate("members", "email name")
      .populate("creator", "email name");

    if (!group) {
      return handleError(res, 404, "Group not found");
    }

    const groupData = {
      id: group._id,
      Groupname: group.Groupname,
      description: group.description,
      category: group.category,
      members: group.members,
      memberCount: group.members.length,
      creator: group.creator,
      slug: group.slug,
      createdAt: group.createdAt,
    };

    res.status(200).json(groupData);
  } catch (error) {
    handleError(res, 500, error.message);
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body; // Require creator's email

    const user = await findUserByEmail(email);
    const group = await Group.findById(groupId);

    if (!checkDocumentExists(group, res, "Group")) return;

    // Delete associated discussions
    await Discussion.deleteMany({ group: groupId });
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      message: "Group and associated discussions deleted successfully",
    });
  } catch (error) {
    handleError(res, 500, error.message);
  }
};

const createDiscussion = async (req, res) => {
  try {
    const { title, content, email, groupId, username, category } = req.body;

    if (!title || !content || !email || !groupId || !username) {
      return handleError(res, 400, "All fields are required");
    }

    const group = await Group.findById(groupId);
    if (!checkDocumentExists(group, res, "Group")) return;

    // Generate slug
    let slug = slugify(title, { lower: true, strict: true });

    // Check if discussion with the same slug/title already exists
    const existingDiscussion = await Discussion.findOne({ slug });

    if (existingDiscussion) {
      return res
        .status(400)
        .json({ message: "A discussion with this title already exists" });
    }

    const discussion = new Discussion({
      title,
      category,
      content,
      slug,
      username,
      group: groupId,
    });

    await discussion.save();

    res.status(201).json(discussion);
  } catch (error) {
    console.error(error);
    handleError(res, 500, error.message);
  }
};

const likeDiscussion = async (req, res) => {
  try {
    const { email, discussionId } = req.body;

    // Debugging: Log the request data
    console.log("Received email:", email);
    console.log("Received discussionId:", discussionId);

    if (!email || !discussionId) {
      return handleError(res, 400, "Email and discussionId are required.");
    }

    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    const isLiked = discussion.likes.includes(email);
    console.log("User has already liked?", isLiked);

    if (isLiked) {
      discussion.likes = discussion.likes.filter(
        (likedEmail) => likedEmail !== email
      );
    } else {
      discussion.likes.push(email.trim().toLowerCase()); // Ensure correct format
    }

    await discussion.save();

    console.log("Updated Likes:", discussion.likes);

    return res.status(200).json({
      message: isLiked ? "Unliked" : "Liked",
      likes: discussion.likes,
    });
  } catch (error) {
    console.error("Error in likeDiscussion:", error);
    handleError(res, 400, error.message);
  }
};

const likeComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const { email } = req.body;

    if (!email) {
      return handleError(res, 400, "Email is required");
    }
    ``;
    const discussion = await Discussion.findById(discussionId);
    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    const comment = discussion.comments.id(commentId);
    if (!checkDocumentExists(comment, res, "Comment")) return;

    // Check if user has already liked the comment
    const isLiked = comment.likes.includes(email);

    if (isLiked) {
      comment.likes = comment.likes.filter(
        (likedEmail) => likedEmail !== email
      );
    } else {
      comment.likes.push(email);
    }

    // Save the parent document
    await discussion.save();

    return res.status(200).json({
      message: isLiked ? "Unliked comment" : "Liked comment",
      likes: comment.likes,
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const editComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const { content } = req.body;

    // Find the discussion by its ID
    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    // Find the specific comment by its ID
    const comment = discussion.comments.id(commentId);

    if (!checkDocumentExists(comment, res, "Comment")) return;

    // Update the content of the comment
    comment.content = content;
    comment.updatedAt = new Date();

    // Save the updated discussion with the modified comment
    await discussion.save();

    // Return the updated comment
    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const { email } = req.body;

    const discussion = await Discussion.findById(discussionId);

    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    // Find the comment
    const comment = discussion.comments.id(commentId);

    if (!checkDocumentExists(comment, res, "Comment")) return;

    // Check if the  comment belongs to the user
    if (comment.email !== email) {
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
      .populate("") // Add more fields if needed
      .populate("group", "name description category, createdAt");

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

    // Find the discussion by slug
    const discussion = await Discussion.findOne({ slug })
      .populate({
        path: "group",
        select: "name description category createdAt",
        populate: { path: "category", select: "name slug" }, // Include category details
      })
      .populate({
        path: "comments",
        select: "content username createdAt", // Fetch username for comments
        options: { sort: { createdAt: -1 } }, // Sort comments by newest first
      })
      .populate("likes", "username") // Fetch only usernames for likes
      .exec();

    // If discussion is not found
    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Reshape the response to match your schema
    const discussionData = {
      _id: discussion._id,
      title: discussion.title,
      content: discussion.content,
      slug: discussion.slug,
      username: discussion.username, // Ensure username is included
      group: discussion.group,
      likes: discussion.likes.map((like) => like?.username),
      comments: discussion.comments.map((comment) => ({
        content: comment.content,
        username: comment.username,
        createdAt: comment.createdAt,
      })),
      createdAt: discussion.createdAt,
    };

    res.status(200).json(discussionData);
  } catch (error) {
    console.error("Error fetching discussion:", error);
    res.status(500).json({ message: "Internal server error" });
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
    const discussion = await Discussion.findById(discussionId).populate("");

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

const Createcomment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, email, username, likes } = req.body;

    const discussion = await Discussion.findById(discussionId);
    if (!checkDocumentExists(discussion, res, "Discussion")) return;

    // Construct the full comment object
    const newComment = {
      content,
      email,
      username,
      likes: likes || [], // Default to an empty array if not provided
      createdAt: new Date(),
    };

    discussion.comments.push(newComment);
    await discussion.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    handleError(res, 400, error.message);
  }
};

const getDiscussionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    console.log("Received groupId:", groupId); // Debugging log

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const discussions = await Discussion.find({ group: groupId })
      .populate("group", "Groupname description category createdAt")
      .sort({ createdAt: -1 });

    if (!discussions.length) {
      return res
        .status(404)
        .json({ message: "No discussions found for this group" });
    }

    res.status(200).json(discussions);
  } catch (error) {
    console.error("Error fetching discussions:", error);
    res.status(500).json({ message: "Internal server error" });
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
};
