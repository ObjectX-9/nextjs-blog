import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ITimelineEvent } from "@/app/model/timeline";

// Create or update timeline events
export async function POST(request: Request) {
  try {
    const { events } = await request.json();
    const db = await getDb();

    // Insert new events with timestamps
    const result = await db.collection<ITimelineEvent>("timelines").insertMany(
      events.map((event: ITimelineEvent) => ({
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        insertedCount: result.insertedCount,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to add timeline events" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error adding timeline events:", error);
    return NextResponse.json(
      { error: "Failed to add timeline events" },
      { status: 500 }
    );
  }
}

// Get all timeline events
export async function GET() {
  try {
    const db = await getDb();
    const events = await db
      .collection<ITimelineEvent>("timelines")
      .find({})
      .sort({ year: -1, month: -1, day: -1 })  
      .toArray();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline events" },
      { status: 500 }
    );
  }
}

// Update a timeline event
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return NextResponse.json(
        { error: "Timeline event ID is required" },
        { status: 400 }
      );
    }

    if (!updateData.year || !updateData.month || !updateData.day || !updateData.title || !updateData.description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection<ITimelineEvent>("timelines").updateOne(
      { _id: new ObjectId(_id) as any },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Timeline event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating timeline event:", error);
    return NextResponse.json(
      { error: "Failed to update timeline event" },
      { status: 500 }
    );
  }
}

// Delete a timeline event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Timeline event ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection<ITimelineEvent>("timelines")
      .deleteOne({ _id: new ObjectId(id) as any });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Timeline event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting timeline event:", error);
    return NextResponse.json(
      { error: "Failed to delete timeline event" },
      { status: 500 }
    );
  }
}
