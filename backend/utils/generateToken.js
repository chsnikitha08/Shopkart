import jwt from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const isProd = process.env.NODE_ENV === "production";

export const clearCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};

export const cookieOptions = {
  ...clearCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export default generateToken;
