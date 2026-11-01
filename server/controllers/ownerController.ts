import { Request, Response } from "express";
import { AuthRequest } from "../types/auth.type.js";
import { Restuarant } from "../models/Restuarant.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import { Booking } from "../models/Booking.js";
// Get Owner restaurant
export const getOwnerRestuarant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restuarant = await Restuarant.findOne({
      owner: req.user?._id,
    });
    if (!restuarant) {
      res.status(200).json(null);
      return;
    }
    res.json(restuarant);
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
    const existing = await Restuarant.findOne({
      owner: req.user?._id,
    });
    if (existing) {
      res.status(400).json({
        message: "Restuarnt already exists",
      });
      return;
    }
    const {
      name,
      description,
      cusine,
      priceRange,
      location,
      address,
      chef,
      tags,
      availableSlots,
      totalSeats,
    } = req.body;

    if (
      !name ||
      !description ||
      !cusine ||
      !priceRange ||
      !location ||
      !address ||
      !chef
    ) {
      res.status(400).json({
        message: "please provide all the Required Fields",
      });
      return;
    }

    // Generate Slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slugExists = await Restuarant.findOne({ slug });
    if (slugExists) {
      res.status(400).json({
        message: "a restuarant with this name already exists",
      });
      return;
    }
    // Handle Image

    let imageUrl = "";
    if (req.file) {
      // handle image upload
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }
    // Setup parsed tags and slots
    const parsedTags =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim())
        : tags || [];
    const parsedSlots =
      typeof availableSlots === "string"
        ? availableSlots.split(",").map((s) => s.trim())
        : availableSlots || ["17:00", "18:00", "19:00", "20:00", "21:00"];
    const restuarant = await Restuarant.create({
      name,
      slug,
      description,
      cusine,
      priceRange,
      location,
      address,
      chef,
      image: imageUrl,

      tags: parsedTags,
      availableSlots: parsedSlots,
      totalSeats: totalSeats ? Number(totalSeats) : 20,
      owner: req.user?._id,
      status: "pending",
    });
    res.status(201).json(restuarant);
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
    const restuarant = await Restuarant.findOne({
      owner: req.user?._id,
    });
    if (!restuarant) {
      res.status(200).json(null);
      return;
    }
    const {
      name,
      description,
      cusine,
      priceRange,
      location,
      address,
      chef,
      tags,
      availableSlots,
      totalSeats,
    } = req.body;
    if (name) restuarant.name = name;
    if (description) restuarant.description = description;
    if (cusine) restuarant.cusine = cusine;
    if (priceRange) restuarant.priceRange = priceRange;
    if (location) restuarant.location = location;
    if (address) restuarant.address = address;
    if (chef) restuarant.chef = chef;
    if (tags) {
      restuarant.tags =
        typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;
    }
    if (availableSlots) {
      restuarant.availableSlots =
        typeof availableSlots === "string"
          ? availableSlots.split(",").map((s) => s.trim())
          : availableSlots;
    }
    if (availableSlots) restuarant.availableSlots = availableSlots;
    if (totalSeats) restuarant.totalSeats = Number(totalSeats);
    if (req.file) {
      // handle image upload
      const result = await uploadToCloudinary(req.file.buffer);
      restuarant.image = result.secure_url;
    }

    const updated = await restuarant.save();
    res.status(200).json(updated);
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
    const restuarant = await Restuarant.findOne({
      owner: req.user?._id,
    });
    if (!restuarant) {
      res.status(404).json({ message: "Restuarant not found" });
      return;
    }
    const bookings = await Booking.find({ restuarant: restuarant._id })
      .populate("user", "name email phone")
      .sort({ date: -1, time: -1 });
    res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.massage,
    });
  }
};
// PUT /api/owner/bookings/:id/status

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
      res.status(400).json({ message: "please enter a valid status" });
      return;
    }
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    const restuarant = await Restuarant.findById(booking.restuarant);
    if (
      !restuarant ||
      restuarant.owner.toString() !== req.user?._id.toString()
    ) {
      res.status(401).json({
        message: "Not Auhorized to Perform this task",
      });
      return;
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.massage,
    });
  }
};
