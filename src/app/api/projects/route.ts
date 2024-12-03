import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Project, ProjectCategory } from "@/config/projects";

export async function POST(request: Request) {
  try {
    const { categories } = await request.json();
    const filePath = path.join(process.cwd(), "src/config/projects.ts");

    const content = `export interface Project {
  title: string;
  description: string;
  url?: string;
  github?: string;
  imageUrl?: string;
  tags: string[];
  status: "completed" | "in-progress" | "planned";
}

export interface ProjectCategory {
  name: string;
  description: string;
  projects: Project[];
}

export const projectData: ProjectCategory[] = ${JSON.stringify(categories, null, 2)};
`;

    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating projects:", error);
    return NextResponse.json(
      { error: "Failed to update projects" },
      { status: 500 }
    );
  }
}
