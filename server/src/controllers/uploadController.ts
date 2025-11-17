import { Request, Response } from "express";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import Media from "../models/media.model";

dotenv.config();

// Configure cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// UPLOAD MEDIA
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.files || !(req.files instanceof Array)) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const files = req.files as Express.Multer.File[];

    // Upload each image to cloudinary
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const uploaded = await cloudinary.v2.uploader.upload(file.path, {
          folder: "kester_uploads",
        });
        return uploaded.secure_url;
      })
    );

    const media = await Media.create({
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags ? req.body.tags.split(",") : [],
      category: req.body.category,
      images: imageUrls,
      problem: req.body.problem,
      solution: req.body.solution,
      link: req.body.link,
    });

    return res.status(201).json(media);
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return res.status(500).json({
      message: "Upload failed",
      error: error.message || error,
    });
  }
};

// GET SINGLE UPLOAD
export const getSingleUpload = async (req: Request, res: Response) => {
  try {
    const upload = await Media.findById(req.params.id);
    if (!upload) return res.status(404).json({ message: "Upload not found" });
    res.json(upload);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// EDIT UPLOAD
export const editUpload = async (req: Request, res: Response) => {
  try {
    const upload = await Media.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!upload) return res.status(404).json({ message: "Upload not found" });

    res.json(upload);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE UPLOAD
export const deleteUpload = async (req: Request, res: Response) => {
  try {
    const deleted = await Media.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Upload not found" });

    res.json({ message: "Upload deleted" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
