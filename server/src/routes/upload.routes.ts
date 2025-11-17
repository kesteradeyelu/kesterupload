import { Router } from "express";
import multer from "multer";
import { uploadMedia, getSingleUpload, editUpload, deleteUpload } from "../controllers/uploadController";

const router = Router();

// Multer local temp handling only (Vercel deletes temp files automatically)
const upload = multer({ dest: "/tmp" });

router.post("/upload", upload.array("images"), uploadMedia);
router.get("/uploads/:id", getSingleUpload);
router.put("/uploads/:id", editUpload);
router.delete("/uploads/:id", deleteUpload);

export default router;
