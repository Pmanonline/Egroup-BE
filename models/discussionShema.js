const mongoose = require("mongoose");
const slugify = require("slugify");

const DiscussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String },
  slug: { type: String, unique: true },
  username: { type: String, required: true }, // Replacing author with username
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  likes: [{ type: String }],
  comments: [
    {
      content: { type: String },
      email: { type: String },
      username: { type: String },
      likes: [{ type: String }],
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

DiscussionSchema.pre("save", async function (next) {
  if (!this.slug) {
    let slug = slugify(this.title, { lower: true, strict: true });
    let existingDiscussion = await mongoose
      .model("Discussion")
      .findOne({ slug });

    let count = 1;
    while (existingDiscussion) {
      slug = `${slug}-${count}`;
      existingDiscussion = await mongoose.model("Discussion").findOne({ slug });
      count++;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Discussion", DiscussionSchema);
