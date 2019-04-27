import {Router} from "express";

import v1 from "./1";

const router = Router();

router.use("/1", v1);

export default router;
