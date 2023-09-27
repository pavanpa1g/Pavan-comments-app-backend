const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { postComment, getCommentsByImageId, deleteCommentById } = require('../controllers/commentController')

const router = express.Router()


router.route('/').post(protect,postComment)
router.route('/:id').get(protect,getCommentsByImageId).delete(protect,deleteCommentById)

module.exports = router;