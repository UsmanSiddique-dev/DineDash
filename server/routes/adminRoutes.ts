import { Router } from "express";
import {
  approveRestuarant,
  getAdminStats,
  getAllRestuarants,
} from "../controllers/adminController.js";
import { adminMiddleware, protect } from "../middlewares/auth.middleware.js";
const adminRouter = Router();

adminRouter.use(protect)
adminRouter.use(adminMiddleware)

adminRouter.get("/restuarants", getAllRestuarants);

adminRouter.put("/restuarants/:id/approve", approveRestuarant);
adminRouter.get("/stats", getAdminStats);
export default adminRouter