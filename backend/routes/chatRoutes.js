const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatControllers');


const router = express.Router()



// addToGroup// chatRoutes is the file that contains all routes for this module
router.route('/').post(protect,accessChat);
router.route('/').get(protect,fetchChats);
router.route('/group').post(protect,createGroupChat);
router.route('/group/rename').put(protect,renameGroup);
router.route('/group/remove').put(protect,removeFromGroup);
router.route("/group/add").put(protect,addToGroup);





module.exports = router;