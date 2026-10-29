import express, { Response, Request, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import restuarantRouter from "./routes/restuarantRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
await connectDB(); // Connect to the database before starting the server

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});
app.use("/api/auth", authRouter);
app.use("/api/restuarants", restuarantRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandle Error ", err);
  res.status(500).json({
    message: err.message || "Internal server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
