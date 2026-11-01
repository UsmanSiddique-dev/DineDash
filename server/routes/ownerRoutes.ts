import {Router} from "express"
import { createOwnerRestuarant, getOwnerBookings, getOwnerRestuarant, updateBookingStatus, updateOwnerRestuarant } from "../controllers/ownerController.js"
import upload from "../config/multer.js"
import { ownerMiddleware, protect } from "../middlewares/auth.middleware.js"

const ownerRouter=Router()
ownerRouter.use(protect)
ownerRouter.use(ownerMiddleware)
ownerRouter.get("/restuarant",getOwnerRestuarant)
ownerRouter.post("/restuarant",upload.single("image"),createOwnerRestuarant)
ownerRouter.put("/restuarant",upload.single("image"),updateOwnerRestuarant)
ownerRouter.get("/bookings",getOwnerBookings)
ownerRouter.put("/bookings/:id/status",updateBookingStatus)

export default ownerRouter;
