import { Router } from 'express';
import { getFeaturedRestuarants, getRestuarantAvailability, getRestuarants, getRestuarantsBySlug } from '../controllers/restuarantController.js';


const restuarantRouter= Router();

restuarantRouter.get("/",getRestuarants)
restuarantRouter.get("/featured",getFeaturedRestuarants)
restuarantRouter.get("/:slug",getRestuarantsBySlug)
restuarantRouter.get("/:id/availability",getRestuarantAvailability)

export default restuarantRouter; 