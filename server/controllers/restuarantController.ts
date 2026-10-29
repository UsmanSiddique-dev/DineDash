import { Response } from "express";
import { Request } from "express";
import { Restuarant } from "../models/Restuarant.js";
import jet from "jsonwebtoken";
import { verifyToken } from "../services/authServices.js";
import { findUserById } from "../services/userServices.js";
import { Booking } from "../models/Booking.js";

// Get All Rastuarants

export const getRestuarants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { search, priceRange, rating, location, sort } = req.query;

    const queryObj: any = { status: "approved" };
    if (search) {
      queryObj.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
          tags: {
            $regex: search,
            $options: "i",
          },
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }
    if (priceRange) {
      const prices = Array.isArray(priceRange) ? priceRange : [priceRange];
      queryObj.priceRange = {
        $in: prices,
      };
    }
    if (rating) {
      queryObj.rating = {
        $gte: parseFloat(rating as string),
      };
    }
    if (location) {
      queryObj.location = {
        $regex: location as string,
        $options: "i",
      };
    }
    let sortOption: any = { createdAt: -1 };
    if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "price_low") {
      sortOption = { priceRange: 1 };
    } else if (sort === "price_high") {
      sortOption = { priceRange: -1 };
    }
    const restuarant = await Restuarant.find(queryObj).sort(sortOption);
    res.json(restuarant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};
export const getFeaturedRestuarants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const featured = await Restuarant.find({
      status: "approved",
      $or: [
        {
          featured: true,
        },
        { exclusive: true },
      ],
    }).limit(6);
    res.json(featured);
  } catch (error: any) {
    console.error("Get Featurd rastrurant ", error);
    res.status(400).json({
      message: error.message,
    });
  }
};
export const getRestuarantsBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const restuarant = await Restuarant.findOne({
      slug: req.params.slug,
    });
    if (!restuarant) {
      res.status(404).json({ message: "Restuarant not Found" });
      return;
    }
    if (restuarant.status !== "approved") {
      let isAuthorized = false;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = verifyToken(token);
          const user = findUserById(decoded.id);
          if (
            (user && user.role === "admin") ||
            (user.role === "owner" &&
              restuarant.owner.toString() === user._id.toString())
          ) {
            isAuthorized = true;
          }
        } catch (error) {
          console.error(error);
        }
      }
      if (!isAuthorized) {
        res.status(404).json({
          message: "Restuarant not found or pending approval",
        });
        return;
      }
    }
    res.json(restuarant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getRestuarantAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({
        message: "please provide a date",
      });
      return;
    }
    const restuarant = await Restuarant.findById(req.params.id);
    if (!restuarant) {
      res.status(400).json({
        message: "Restuarant not found",
      });
      return;
    }
    const bookingDate = new Date(date as string);

    const bookings = await Booking.find({
      restuarant: restuarant._id,

      date: bookingDate,
      status: "confirmed",
    });

    // Map slots to availabel capacity

    const availability = restuarant.availableSlots.map((slot) => {
      const bookedSeats = bookings
        .filter((b) => b.time === slot)
        .reduce((sum, b) => sum + b.guests, 0);
      const totalSeats = restuarant.totalSeats || 20;
      const availableSeats = Math.max(0, totalSeats - bookedSeats);
      return {
        time: slot,
        availableSeats,
        isAvailable: availableSeats > 0,
      };
    });
    res.json(availability);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};
