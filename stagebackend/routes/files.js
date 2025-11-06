const express = require('express');
const fileController = require('../controllers/fileController');



const router = express.Router();
const auth = require('../middleware/auth');


router.get('/getFiles', fileController.getFiles);
router.get('/getFileById/:id', fileController.getFileById);
router.get('/countByUser', fileController.getFilesCountByUser);
router.get('/countByMonth' , fileController.countByMonth);
router.get('/modifiedStats' , fileController.modifiedstats);
router.get('/getCreatedFiles' ,auth, fileController.getCreatedFilesThisWeek);
router.get('/getModifiedFiles' ,auth, fileController.getModifiedFilesThisWeek);
router.get('/filesperday', fileController.getFilesCreatedPerDay);
router.get('/modifiedperday', fileController.getFilesModifiedPerDay);
router.get('/getUserFiles',auth, fileController.getAllFilesByUserId);

router.post('/addFile',auth, fileController.createFile);

router.put('/updateFile/:id', fileController.updateFile);



router.delete('/deleteFile/:id', fileController.deleteFile);

module.exports = router;