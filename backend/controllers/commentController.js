const Comment = require("../models/commentModel");
const Image = require("../models/imagesModel");

const postComment = async (req, res) => {
  const { imageId, comment } = req.body;

  if (!imageId || !comment) {
    return res.status(401).json({ message: "please provide all the fields" });
  }

  try {
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: "No such post" });
    }

    const newComment = {
      commentedBy: req.user._id,
      comment: comment,
      commentedOn: image._id,
    };

    const fullComment = await Comment.create(newComment);

    await Image.findByIdAndUpdate(imageId,{
        $inc: {commentsCount:1}
    })

    return res
      .status(200)
      .json({ message: "commented successfully", fullComment });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const getCommentsByImageId = async (req, res) => {
  const imageId = req.params.id;

  console.log(imageId);

  if (!imageId) {
    return res.status(403).json({ message: "Please provide an image id" });
  }

  try {
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: `no such image found` });
    }

    const comments = await Comment.find()
      .where("commentedOn")
      .equals(`${imageId}`)
      .populate("commentedBy", "-password")
      .populate("commentedOn");

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

const deleteCommentById = async (req, res) => {
  const commentId = req.params.id;

  if (!commentId) {
    return res.status(401).json({ message: "please provide a commentID" });
  }

  try {
    const comment = await Comment.findById(commentId).populate("commentedOn");

    if (!comment) {
      return res.status(404).json({ message: `No Such Comment Found` });
    }

    if (
      comment.commentedBy.toString() === req.user._id.toString() ||
      comment.commentedOn.postedBy.toString() === req.user._id.toString()
    ) {

        const imageId = comment.commentedOn
      await Comment.findByIdAndDelete(commentId);

      await Image.findByIdAndUpdate(imageId,{
        $inc: {commentsCount:-1}
    })
      return res.status(200).json({ message: "Comment deleted successfully" });

    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};


module.exports = { postComment, getCommentsByImageId, deleteCommentById };
