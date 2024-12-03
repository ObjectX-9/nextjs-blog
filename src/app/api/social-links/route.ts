import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { socialLinks } = await request.json();
    const filePath = path.join(process.cwd(), "src/config/social-links.ts");

    const content = `export const socialLinks = ${JSON.stringify(socialLinks, null, 2)} as const;
`;

    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating social links:", error);
    return NextResponse.json(
      { error: "Failed to update social links" },
      { status: 500 }
    );
  }
}
