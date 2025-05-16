var express = require("express");
var router = express.Router();

/* GET home page. */
// GET 请求主页
router.get("/", (req, res) => {
  res.redirect("/catalog");
});

module.exports = router;
