import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { events } = await request.json();
    const filePath = path.join(process.cwd(), "src/config/timelines.ts");

    const content = `export interface TimelineLink {
  text: string;
  url: string;
}

export interface TimelineEvent {
  year: number;
  month: number;
  title: string;
  location?: string;
  description: string;
  tweetUrl?: string;
  imageUrl?: string;
  links?: TimelineLink[];
}

export const timelineEvents: TimelineEvent[] = ${JSON.stringify(events, null, 2)};
`;

    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating timeline events:", error);
    return NextResponse.json(
      { error: "Failed to update timeline events" },
      { status: 500 }
    );
  }
}
