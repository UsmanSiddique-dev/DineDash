import jwt from "jsonwebtoken";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

export const generateToken = (id: string) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: "30d",
  });
};

export const verifyToken = (token: string): { id: string } => {
  return jwt.verify(token, getJwtSecret()) as { id: string };
};
