import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  try {
    const cookie = req.headers.cookie || "";
    const m = cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
    const token = m && decodeURIComponent(m[1]);
    if (!token) return res.status(401).json({ status: 401, message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "sankalp");
    const user = await User.findById(payload._id).select("-password");
    if (!user) return res.status(401).json({ status: 401, message: "Invalid user" });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
};
