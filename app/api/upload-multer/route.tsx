import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

function generateUniqueFileName(
  userName: string,
  fileExtension: string
): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString("hex");
  const sanitizedUserName = userName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return `${sanitizedUserName}_${timestamp}_${randomString}${fileExtension}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const userName = formData.get("name") as string | null;

  if (!file || !userName) {
    return NextResponse.json(
      { error: "No file uploaded or name provided" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileExtension = "." + file.name.split(".").pop();
  const uniqueFileName = generateUniqueFileName(userName, fileExtension);

  const path = join(process.cwd(), "public/uploads", uniqueFileName);
  await writeFile(path, buffer);

  const filePath = `/uploads/${uniqueFileName}`;

  return NextResponse.json({
    message: "File uploaded successfully",
    filePath: filePath,
  });
}
