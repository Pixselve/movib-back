import {Router} from "express";

const router = Router();
import {MyError} from "../classes/MyError";
import {MongoError} from "mongodb";
import {errors} from "celebrate";

import api from "./api";

router.use("/api", api);

router.get('*', function (req, res, next) {
  next(new MyError(404, "Page not found."));
});
router.use(errors());
router.use((err, req, res, next) => {
  if (err instanceof MongoError) {
    return res.status(400).json({error: {status: 503, message: err.message}});
  } else {
    next(err);
  }
});
router.use((err, req, res, next) => {
  const {status, message} = err;
  res.status(status || 400).json({error: {status, message}});
});
export default router;
