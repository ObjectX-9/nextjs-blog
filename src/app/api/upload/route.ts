import { NextResponse } from "next/server";
import OSS from "ali-oss";
import { v4 as uuidv4 } from "uuid";

// Check if all required environment variables are set
const requiredEnvVars = {
  region: process.env.OSS_REGION || process.env.NEXT_PUBLIC_OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || process.env.NEXT_PUBLIC_OSS_BUCKET,
};

// Validate environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

const client = new OSS({
  region: requiredEnvVars.region!,
  accessKeyId: requiredEnvVars.accessKeyId!,
  accessKeySecret: requiredEnvVars.accessKeySecret!,
  bucket: requiredEnvVars.bucket!,
});

export async function POST(request: Request) {
  try {
    // Check if any environment variables are missing
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Log file details for debugging
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get directory path from form data or default to 'album'
    const directory = formData.get("directory") as string || "album";

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `/images/${directory}/${uuidv4()}.${ext}`;

    console.log("Attempting to upload file:", filename);

    // Upload to OSS
    const result = await client.put(filename, buffer);

    console.log("Upload successful:", result.url);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    // Detailed error logging
    console.error("Upload error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });

    // Return a more informative error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to upload file: ${errorMessage}` },
      { status: 500 }
    );
  }
}
