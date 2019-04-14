const router = require("express").Router();

router.use('/', require('./login'));
router.use("/discover", require("./discover"));
router.use("/genres", require("./genres"));
router.use("/movies", require("./movies"));


module.exports = router;
