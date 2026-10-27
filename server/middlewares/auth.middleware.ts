import dotenv from "dotenv";
import { verifyToken } from "../services/authServices.js";
import { findUserById } from "../services/userServices.js";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/auth.type.js";

dotenv.config();

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authorization token is required",
    });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({
      message: "Authorization token is required",
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);
    if (!user) {
      res.status(401).json({
        message: "Not Authorized. User not found",
      });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication failed:", error);
    res.status(401).json({
      message: "Not Authorized. Token failed",
    });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Access Denied,Admin role required",
    });
  }
};
export const ownerMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user && (req.user.role === "owner" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      message: "Access Denied,resturant owner  role required",
    });
  }
};
