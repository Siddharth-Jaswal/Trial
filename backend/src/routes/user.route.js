import { Router } from "express";
import { register, login, authMe, logout } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/auth/me", requireAuth, (req, res) => res.json({ status: 200, data: req.user }));
router.post("/logout", logout);

export default router;
