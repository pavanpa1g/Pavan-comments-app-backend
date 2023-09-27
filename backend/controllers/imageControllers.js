const Image = require("../models/imagesModel");

const uploadImage = async (req, res) => {
  const { imageUrl, description } = req.body;

  console.log(imageUrl, description);

  if (!imageUrl) {
    return res.status(401).json({ message: "Please provide imageUrl" });
  }

  try {
    const newImage = {
      imageUrl,
      postedBy: req.user._id,
      likes: 0,
      likedBY: [],
      commentsCount: 0,
      description,
    };
    const imagePosted = await Image.create(newImage);

    const FullImagePost = await Image.findOne({
      _id: imagePosted._id,
    }).populate("postedBy", "-password");

    return res.status(200).json(FullImagePost);
  } catch (error) {
    console.log("Error in uploading the images ", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const getImages = async (req, res) => {
  try {
    const allImages = await Image.find().populate("postedBy", "-password").populate('likedBy',"-password")

    return res.status(200).json(allImages);
  } catch (error) {
    console.log("Error while fetching the Images ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getImageById = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(403).json({ message: "no id provided" });
  }

  try {
    const image = await Image.findById(id);

    if (!image) {
      return res.status(401).json({ message: "Post not found" });
    }

    const getImage = await Image.findById(id).populate("postedBy", "-password");

    return res.status(200).json(getImage);
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

const deleteImage = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(403).json({ message: "no image id provided to delete" });
  }

  try {
    const image = await Image.findById(id);

    if (!image) {
      return res.status(401).json({ message: "Post not found" });
    }

    if (image.postedBy.toString() !== req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized to delete this post" });
    }

    await Image.findByIdAndDelete(id);
    return res.status(200).json({ message: "successfully deleted Image" });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", error });
  }
};

const getImageByUserId = async (req, res) => {
  try {
    const images = await Image.find()
      .where("postedBy")
      .equals(`${req.user._id}`)
      .populate("postedBy", "-password")
      .populate('likedBy',"-password")

    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const updateImageLike = async (req, res) => {
  const imageId = req.params.imageId;
  console.log("imageId", imageId);

  try {
    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).send("No such image");
    }

    let updatedLikes;

    if (image.likedBy.includes(req.user._id)) {
      // If user has already liked the post, remove like
      updatedLikes = await Image.findByIdAndUpdate(
        imageId,
        {
          $pull: { likedBy: req.user._id },
          $inc: { likes: -1 },
        },
        { new: true }
      )
        .populate("postedBy", "-password")
        .populate("likedBy", "-password");
    } else {
      // If user has not liked the post, add like
      updatedLikes = await Image.findByIdAndUpdate(
        imageId,
        {
          $addToSet: { likedBy: req.user._id },
          $inc: { likes: 1 },
        },
        { new: true }
      )
        .populate("postedBy", "-password")
        .populate("likedBy", "-password");
    }

    return res.status(200).json(updatedLikes);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};


module.exports = {
  uploadImage,
  getImages,
  deleteImage,
  getImageById,
  getImageByUserId,
  updateImageLike,
};
