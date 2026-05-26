import { Router, type IRouter } from "express";
import healthRouter from "./health";
import moodsRouter from "./moods";
import journalRouter from "./journal";
import wellnessRouter from "./wellness";
import dashboardRouter from "./dashboard";
import openaiChatRouter from "./openai-chat";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(moodsRouter);
router.use(journalRouter);
router.use(wellnessRouter);
router.use(dashboardRouter);
router.use(openaiChatRouter);
router.use(adminRouter);

export default router;
