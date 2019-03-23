var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.set('Content-Type', 'application/xml');
  res.send('sitemap/sitemap.xml');
});

module.exports = router;
