import {Router} from "express";

import v1 from "./1";

const router = Router();
//Indique que le router doit utiliser le module « v1 » en suivant la route « /1 »
router.use("/1", v1);

export default router;
