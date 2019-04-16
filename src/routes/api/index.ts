import {Router} from "express";

import v1 from "./1";

const router = Router();
router.get('/', function (req, res) {
  res.send('Birds home page')
});
router.use("/1", v1);

export default router;
