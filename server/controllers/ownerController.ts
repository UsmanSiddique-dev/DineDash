import { Request, Response } from "express";
import { AuthRequest } from "../types/auth.type.js";
import { Restaurant } from "../models/Restaurant.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import { Booking } from "../models/Booking.js";
// Get Owner restaurant
export const getOwnerRestaurant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user?._id,
    });
    if (!restaurant) {
      res.status(200).json(null);
      return;
    }
    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.massage,
    });
  }
};
export const createOwnerRestaurant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const existing = await Restaurant.findOne({
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
      cuisine,
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
      !cuisine ||
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
    const slugExists = await Restaurant.findOne({ slug });
    if (slugExists) {
      res.status(400).json({
        message: "a restaurant with this name already exists",
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
    const restaurant = await Restaurant.create({
      name,
      slug,
      description,
      cuisine,
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
    res.status(201).json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};
// PUT
export const updateOwnerRestaurant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user?._id,
    });
    if (!restaurant) {
      res.status(200).json(null);
      return;
    }
    const {
      name,
      description,
      cuisine,
      priceRange,
      location,
      address,
      chef,
      tags,
      availableSlots,
      totalSeats,
    } = req.body;
    if (name) restaurant.name = name;
    if (description) restaurant.description = description;
    if (cuisine) restaurant.cuisine = cuisine;
    if (priceRange) restaurant.priceRange = priceRange;
    if (location) restaurant.location = location;
    if (address) restaurant.address = address;
    if (chef) restaurant.chef = chef;
    if (tags) {
      restaurant.tags =
        typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;
    }
    if (availableSlots) {
      restaurant.availableSlots =
        typeof availableSlots === "string"
          ? availableSlots.split(",").map((s) => s.trim())
          : availableSlots;
    }
    if (availableSlots) restaurant.availableSlots = availableSlots;
    if (totalSeats) restaurant.totalSeats = Number(totalSeats);
    if (req.file) {
      // handle image upload
      const result = await uploadToCloudinary(req.file.buffer);
      restaurant.image = result.secure_url;
    }

    const updated = await restaurant.save();
    res.status(200).json(updated);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      message: error.massage,
    });
  }
};
// GET bookings foe owner Restaurant
export const getOwnerBookings = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user?._id,
    });
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }
    const bookings = await Booking.find({ restaurant: restaurant._id })
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
    const restaurant = await Restaurant.findById(booking.restaurant);
    if (
      !restaurant ||
      restaurant.owner.toString() !== req.user?._id.toString()
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
