import { NextResponse } from "next/server";
import OSS from "ali-oss";
import { v4 as uuidv4 } from "uuid";

const client = new OSS({
  region: process.env.NEXT_PUBLIC_OSS_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.NEXT_PUBLIC_OSS_BUCKET!,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `/images/album/${uuidv4()}.${ext}`;

    // Upload to OSS
    const result = await client.put(filename, buffer);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}