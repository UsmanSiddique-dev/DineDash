import { Response } from "express";
import { AuthRequest } from "./../types/auth.type.js";
import { Restuarant } from "../models/Restuarant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

// GET all restuarants\

export const getAllRestuarants = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restuarants = await Restuarant.find({})
      .populate("owner", "name email phone")
      .sort({
        createdAt: -1,
      });
    res.json(restuarants);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
};
// Approve a restuarnat or reject
// PUT ?api/admin/restuarant/:id/approve
export const approveRestuarant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      res.status(400).json({
        message: "Please Provide a valid approval status",
      });
      return;
    }
    const restuarant = await Restuarant.findById(req.params.id);
    if (!restuarant) {
      res.status(404).json({
        message: "Restuarant profile not found",
      });
      return;
    }
    restuarant.status = status;
    await restuarant.save();
    res.json(restuarant);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
};
export const getAdminStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({
      role: "user",
    });
    const totalOwners = await User.countDocuments({
      role: "owner",
    });
    const totalBookings = await Booking.countDocuments({});
    const totalRestuarants = await Restuarant.countDocuments({});

    const latestBookings = await Booking.find({})
      .populate("user", "name email")
      .populate("restuarant", "name")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({
        users:{
            totalUsers,
            totalOwners,
            total:totalUsers + totalOwners
        },
        restuarants:{
            total: totalRestuarants
        },
        bookings:{
            total:totalBookings
        },
        latestBookings
    });

  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
};
