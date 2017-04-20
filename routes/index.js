var express = require('express');
var router = express.Router();
var db = require('../queries');

router.get('/api/storage', db.getStorageInfo);
router.get('/api/:storage/objects/:id?', db.getAllObjects);
router.get('/api/:storage/object/:id', db.getSingleObject);
router.post('/api/:storage/objects', db.createObject);
router.put('/api/:storage/objects/:id', db.updateObject);
router.delete('/api/:storage/objects/:id', db.removeObject);

module.exports = router;
