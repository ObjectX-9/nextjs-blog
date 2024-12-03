import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
  try {
    const workspaces = await request.json();
    const filePath = path.join(process.cwd(), "src/config/workspace-items.ts");
    
    const fileContent = `interface WorkspaceItem {
  id: number;
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

export const workspaceItems: WorkspaceItem[] = ${JSON.stringify(workspaces, null, 2)};
`;

    await writeFile(filePath, fileContent, "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving workspaces:", error);
    return NextResponse.json({ success: false, error: "Failed to save workspaces" }, { status: 500 });
  }
}
