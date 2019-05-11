import {Router} from "express";

const router = Router();

import user from "./user";
import movies from "./movies";
import science from "./science";

router.use("/movies", movies);
router.use('/science', science);
router.use("/user", user);


export default router;
