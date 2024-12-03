import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { photos } = await request.json();
    const filePath = path.join(process.cwd(), "src/config/photos.ts");

    const content = `export interface Photo {
  src: string;
  width: number;
  height: number;
  title: string;
  location: string;
  date: string;
}

export const photos: Photo[] = ${JSON.stringify(photos, null, 2)};
`;

    await fs.writeFile(filePath, content, "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating photos:", error);
    return NextResponse.json({ error: "Failed to update photos" }, { status: 500 });
  }
}
