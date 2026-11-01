import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "QuickDine",
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("upload failed"));
        resolve({ secure_url: result.secure_url });
      },
    );
    stream.end(fileBuffer)
  });
};
