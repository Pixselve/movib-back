const router = require("express").Router();
const api = require("./api");
import {MyError} from "@root/classes/MyError";
import {MongoError} from "mongodb";

router.use("/api", api);

router.get('*', function (req, res, next) {
  next(new MyError(404, "Page not found."));
});
router.use((err, req, res, next) => {
  if (err instanceof MongoError) {
    return res.status(503).json({error: {status: 503, message: err.message}});
  } else {
    next(err);
  }
});
router.use((err, req, res, next) => {
  const {status, message} = err;
  res.status(status || 500).json({error: {status, message}});
});
module.exports = router;
