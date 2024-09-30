import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64String}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          resource_type: "auto",
          folder: "user_photos",
          transformation: [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto:good", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
