const mongoose = require("mongoose");
const slugify = require("slugify");

const DiscussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      content: { type: String, required: true },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
DiscussionSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Discussion", DiscussionSchema);
