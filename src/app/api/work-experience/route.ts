import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { workExperiences } = await request.json();
    const filePath = path.join(process.cwd(), "src/config/work-experience.ts");

    const content = `export interface WorkExperience {
  company: string;
  companyUrl: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string | null; // null means current position
}

export const workExperiences: WorkExperience[] = ${JSON.stringify(workExperiences, null, 2)};
`;

    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating work experiences:", error);
    return NextResponse.json(
      { error: "Failed to update work experiences" },
      { status: 500 }
    );
  }
}
