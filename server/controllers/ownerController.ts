import { Request, Response } from "express";
import { AuthRequest } from "../types/auth.type.js";
import { Restuarant } from "../models/Restuarant.js";

// Get Owner restaurant
export const getOwnerRestuarant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restuarant= await Restuarant.findOne({
        owner: req.user?._id,
        
    })
    if (!restuarant) {
        res.status(200).json(null)
        return
    }
    res.json(restuarant)

  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.massage,
    });
  }
};
export const createOwnerRestuarant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.massage,
    });
  }
};
// PUT
export const updateOwnerRestuarant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.massage,
    });
  }
};
// GET bookings foe owner Restuarant
export const getOwnerBookings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.massage,
    });
  }
};
// PUT /api/owner/bookings/:id/status

export const updateBookingStatus= async(req:AuthRequest,res:Response): Promise<void>=>{
   try {
    
   } catch (error:any) {
    console.error(error)
    res.status(400).json({
        message:error.massage
    })
    
   }

}
