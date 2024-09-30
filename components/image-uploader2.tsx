"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import compress from "browser-image-compression";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import React from "react";

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !name || !email) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Compress the image
      const compressedFile = await compress(file, {
        maxSizeMB: 0.3, // 300 KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      // Create a FormData object to send the file and other data
      const formData = new FormData();
      formData.append("file", compressedFile, compressedFile.name);
      formData.append("name", name);
      formData.append("email", email);

      // Send the compressed file and data to your server
      const response = await fetch("/api/upload-multer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedUrl(data.filePath);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800">Image Upload</h2>
      <div className="w-full space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="file">Image</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1"
          />
        </div>
      </div>
      <Button
        onClick={handleUpload}
        disabled={!file || uploading || !name || !email}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload"
        )}
      </Button>
      {error && <div className="text-red-500 mt-2">Error: {error}</div>}
      {uploadedUrl && (
        <div className="text-center">
          <p className="text-green-600 font-semibold mb-2">
            Uploaded successfully!
          </p>
          <div className="relative w-64 h-64">
            <Image
              src={uploadedUrl}
              alt="Uploaded"
              width={256}
              height={256}
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
