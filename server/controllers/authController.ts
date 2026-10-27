import { Request,Response } from 'express';
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../services/authServices.js";
import { AuthRequest } from '../types/auth.type.js';

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    if (!name || !email || !password) {
      res.status(400).json({ message: "Please enter all required fields" });
      return;
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({
        message: "invalid User Data",
      });
    }
  } catch (error:any) {
    console.log(error);
    res.status(400).json({
      message: error.message,
    });
  }
};
// POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Please Provide  all required fields" });
      return;
    }
    // Check for User
    const user = await User.findOne({
      email,
    });
    if (!user) {
      res.status(400).json({ message: "User does not exist" });
      return;
    }

    const isMatched = await bcrypt.compare(password, user.password || "");
    if (!isMatched) {
      res.status(400).json({
        message: "Creadential are incorrect",
      });
      return;
    }
    res.status(201).json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    console.error(error);
    
    res.status(400).json({
      message: error.message,
    });
  }
};
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if(!req.user){
      res.status(401).json({
        message:"Not Authorized"
      })
      return
    }
    res.json(req.user)
  } catch (error :any) {
    console.error(error)
    res.status(400).json({
      message:error.message
    })
  }
};
