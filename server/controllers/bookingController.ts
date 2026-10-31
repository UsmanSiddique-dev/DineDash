// Create a New Booking
// Post /api/bookings

import { Response } from "express";
import { AuthRequest } from "../types/auth.type.js";
import { Restuarant } from "../models/Restuarant.js";
import { Booking } from "../models/Booking.js";

// @access private
export const createBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { restuarantId, date, time, guests, occasion, specialRequests } =
      req.body;

    if (!restuarantId || !date || !time || !guests) {
      res.status(400).json({
        message: "Please Provide all Required reservation Details",
      });
      return;
    }

    const restuarant = await Restuarant.findById(restuarantId);
    if (!restuarant) {
      res.status(400).json({
        message: "Restuarant Not Found",
      });
      return;
    }

    if (restuarant.status !== "approved") {
      res.status(400).json({
        message: "Reservations are yet opened for this restuarant",
      });
      return;
    }

    const requestedGuests = Number(guests);
    const existingBookings = await Booking.find({
      restuarant: restuarantId,
      date: new Date(date),
      time,
      status: "confirmed",
    });

    const bookedSeats = existingBookings.reduce(
      (sum, booking) => sum + booking.guests,
      0,
    );
    const totalSeats = restuarant.totalSeats || 20;
    const availableSeats = totalSeats - bookedSeats;

    if (requestedGuests > availableSeats) {
      res.status(400).json({
        message: `Unable to reserve, only ${availableSeats} seats are available for this time slot`,
      });
      return;
    }

    const booking = await Booking.create({
      user: req.user?._id,
      restuarant: restuarantId,
      date: new Date(date),
      time,
      guests: requestedGuests,
      occasion,
      specialRequests,
      status: "confirmed",
    });

    const populatedBooking = await booking.populate(
      "restuarant",
      "name location image address",
    );
    res.status(201).json(populatedBooking);

    res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};
// Get login user bookings
// /api/bookind/my
export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate("restuarant", "name location image address slug")
      .sort({ date: -1, time: -1 });
    res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({
        message: "Booking not found",
      });
      return;
    }
    if (booking.user.toString() !== req.user?._id.toString()) {
      res.status(401).json({
        message: "Not Authorized to perfom this task",
      });
      return;
    }
    booking.status = "canceled";
    await booking.save();
  const populatedBooking=  await booking.populate("restuarant","name location image address ")
  res.json(populatedBooking)
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};
