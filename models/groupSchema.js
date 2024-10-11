const mongoose = require("mongoose");
const slugify = require("slugify");
const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
  slug: {
    type: String,
    unique: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

GroupSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

module.exports = mongoose.model("Group", GroupSchema);
