var express = require('express');
var router = express.Router();
var db = require('../queries');

router.get('/api/storage', db.getStorageInfo);
router.get('/api/:storage/objects/:id?', db.getAllObjects);
router.get('/api/:storage/object/:id', db.getSingleObject);
router.post('/api/:storage/directory', db.createDirectoryObject);
router.post('/api/:storage/file', db.createFileObject);
router.put('/api/:storage/object/:id', db.updateObject);
router.delete('/api/:storage/object/:id', db.removeObject);

module.exports = router;
