// const mongoose = require("mongoose");
// const slugify = require("slugify");
// const GroupSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   category: String,
//   createdAt: { type: Date, default: Date.now },
//   slug: {
//     type: String,
//     unique: true,
//   },
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
// });

// GroupSchema.pre("save", function (next) {
//   if (this.isModified("name")) {
//     this.slug = slugify(this.name, { lower: true });
//   }
//   next();
// });

// module.exports = mongoose.model("Group", GroupSchema);

// groupSchema.js
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
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "moderator"], // Restrict to valid roles
    },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: String,
  slug: {
    type: String,
    unique: true,
  },
  creator: {
    type: memberSchema,
    // required: true,
  },
  members: [memberSchema], // Array of member objects
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook for slug generation
groupSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Group", groupSchema);
