import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary.js";

const assertCloudinaryConfig = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary environment variables are not configured.");
  }
};

export const cloudinaryUpload = async (file) => {
  assertCloudinaryConfig();

  if (!file?.buffer) {
    throw new Error("No image file was provided.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "grambazaar",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });
};
