import {Router} from "express";

const router = Router();

router.use('/', require('./login'));
router.use("/discover", require("./discover"));
router.use("/genres", require("./genres"));
router.use("/movies", require("./movies"));
router.use('/science', require('./science'));


export default router;
