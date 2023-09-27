const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { uploadImage, getImages,deleteImage, getImageById, getImageByUserId,updateImageLike } = require("../controllers/imageControllers");

const router = express.Router();

router.route("/").post(protect, uploadImage).get(protect,getImages)
router.route('/:id').delete(protect,deleteImage).get(protect,getImageById)
router.route('/my/posts').get(protect,getImageByUserId)
router.route('/like/:imageId').put(protect,updateImageLike)
module.exports = router;
