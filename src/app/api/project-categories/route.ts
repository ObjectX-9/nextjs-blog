import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ProjectCategoryDB } from "@/app/model/project";

// Get all project categories
export async function GET() {
  try {
    const db = await getDb();
    const categories = await db
      .collection<ProjectCategoryDB>("projectCategories")
      .find()
      .toArray();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching project categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch project categories" },
      { status: 500 }
    );
  }
}
