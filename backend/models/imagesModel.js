const mongoose = require("mongoose");

const imagesModel = mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    imageUrl: { type: String, required: true },
    description: { type: String ,trim: true},
    likes: { type: Number,default:0 },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentsCount:{type:Number,default:0}
  },
  {
    timestamps: true,
  }
);


const Image = mongoose.model("Image",imagesModel);

module.exports = Image;