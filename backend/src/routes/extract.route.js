import { Router } from "express";
import multer from "multer";
import { extractPrescription } from "../controllers/extract.controller.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// POST /api/extract (multipart/form-data) field: file
router.post("/extract", upload.single("file"), extractPrescription);

export default router;
