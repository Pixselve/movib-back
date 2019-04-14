const router = require("express").Router();
const v1 = require("./1");

router.get('/', function (req, res) {
  res.send('Birds home page')
});
router.use("/1", v1);

module.exports = router;
