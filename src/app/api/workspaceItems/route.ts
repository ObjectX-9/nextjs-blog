import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const workspaceItems = await db
      .collection("workspaceItems")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      items: workspaceItems,
    });
  } catch (error) {
    console.error("Error fetching workspace items:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch workspace items",
      },
      { status: 500 }
    );
  }
}
