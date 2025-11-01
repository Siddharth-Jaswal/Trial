import extractRouter from "./routes/extract.route.js";
import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import userRouter from "./routes/user.route.js";
import { telegramSetup } from "./services/telegramReminder.service.js";import scheduleRouter from "./routes/schedule.route.js";


const app = express();
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => res.json({ ok: true, service: "SANKALP backend" }));

const MAIN_MONGO = process.env.MONGO_URI;
if (!MAIN_MONGO) {
  console.warn("MONGO_URI not set (required for Telegram + app DB)");
}
await mongoose.connect(MAIN_MONGO);
console.log("✅ MongoDB connected successfully");

// --- Mount routes ---
app.use("/api/users", userRouter);

// --- Initialize Telegram bot service ---
await telegramSetup();

const port = process.env.PORT || 3000;
app.use("/api", scheduleRouter);
app.use("/api", extractRouter);
app.listen(port, () => console.log(`🚀 API listening on ${port}`));
