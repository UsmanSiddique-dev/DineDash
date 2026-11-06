import { Router } from "express";
import {
  approveRestaurant,
  getAdminStats,
  getAllRestaurants,
} from "../controllers/adminController.js";
import { adminMiddleware, protect } from "../middlewares/auth.middleware.js";
const adminRouter = Router();

adminRouter.use(protect)
adminRouter.use(adminMiddleware)

adminRouter.get("/restaurants", getAllRestaurants);

adminRouter.put("/restaurants/:id/approve", approveRestaurant);
adminRouter.get("/stats", getAdminStats);
export default adminRouter