import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { friends } = await request.json();
    const filePath = path.join(process.cwd(), "src/config/friends.ts");

    const content = `export interface Friend {
  avatar: string;
  name: string;
  title: string;
  description: string;
  link: string;
  position?: string;
  location?: string;
}

export const friends: Friend[] = ${JSON.stringify(friends, null, 2)};
`;

    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating friends:", error);
    return NextResponse.json(
      { error: "Failed to update friends" },
      { status: 500 }
    );
  }
}
