const mongoose = require("mongoose");
const slugify = require("slugify");

// Define member schema as a subdocument
const memberSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    name: {
      type: String,

      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema({
  Groupname: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "Group name must be at least 2 characters"],
  },
  description: {
    type: String,
    required: true, // Match frontend validation
  },
  category: {
    type: String,
    required: true, // Match frontend validation
    enum: ["Technology", "Health", "Education", "Entertainment", "Business"], // Match frontend categories
  },
  slug: {
    type: String,
    unique: true,
  },
  creator: {
    type: memberSchema,
    required: true, // Should be required as per business logic
  },
  members: [memberSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook for slug generation
groupSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.Groupname, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Group", groupSchema);
