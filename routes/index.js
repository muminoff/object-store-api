var express = require('express');
var router = express.Router();
var db = require('../queries');

router.get('/api/objects/:id?', db.getAllObjects);
router.get('/api/object/:id', db.getSingleObject);
router.post('/api/objects', db.createObject);
router.put('/api/objects/:id', db.updateObject);
router.delete('/api/objects/:id', db.removeObject);

module.exports = router;
