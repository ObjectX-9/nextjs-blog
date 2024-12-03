import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { stacks } = await request.json();
    const filePath = path.join(process.cwd(), "src/config/stacks.ts");

    const content = `interface StackItem {
  title: string;
  description: string;
  link: string;
  iconSrc: string;
}

export const stackList: StackItem[] = ${JSON.stringify(stacks, null, 2)};
`;

    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating stacks:", error);
    return NextResponse.json(
      { error: "Failed to update stacks" },
      { status: 500 }
    );
  }
}
