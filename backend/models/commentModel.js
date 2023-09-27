const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    commentedOn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    comment: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
