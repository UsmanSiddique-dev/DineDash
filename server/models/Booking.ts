import { Document, model, Schema, Types } from "mongoose";
import crypto from "crypto";
export interface IBooking extends Document {
  user: Types.ObjectId;
  restuarant: Types.ObjectId;
  date: Date;
  time: string;
  guests: number;
  occasion?: string;
  specialRequests?: string;
  status: "confirmed" | "canceled" | "completed";
  bookingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",

      required: true,
    },
    restuarant: {
      type: Schema.Types.ObjectId,
      ref: "Restuarant",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      trim: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    occasion: {
      type: String,
      trim: true,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["cofirmed", "canceled", "completed"],
      default: "confirmed",
    },
    bookingId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

BookingSchema.pre("save", function () {

  if (!this.bookingId) {
    this.bookingId = `GR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }
});

export const Booking=model<IBooking>("Booking",BookingSchema)
// export const User = model("user", UserSchema);
