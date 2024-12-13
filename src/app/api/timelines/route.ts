import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ITimelineEvent } from "@/app/model/timeline";

interface TimelineResponse {
  success: boolean;
  events?: ITimelineEvent[];
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Create or update timeline events
export async function POST(request: Request) {
  try {
    const { events } = await request.json();
    const db = await getDb();
    const collection = db.collection<ITimelineEvent>("timelines");

    // Validate events
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid events data" },
        { status: 400 }
      );
    }

    // Insert new events with timestamps
    const result = await collection.insertMany(
      events.map((event: ITimelineEvent) => ({
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    if (!result.acknowledged) {
      throw new Error("Failed to add timeline events");
    }

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("Error adding timeline events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add timeline events" },
      { status: 500 }
    );
  }
}

// Get all timeline events with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const db = await getDb();
    const collection = db.collection<ITimelineEvent>("timelines");

    const [events, total] = await Promise.all([
      collection
        .find({})
        .sort({ year: -1, month: -1, day: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments()
    ]);

    const response: TimelineResponse = {
      success: true,
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timeline events" },
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
        { success: false, error: "Timeline event ID is required" },
        { status: 400 }
      );
    }

    const validationErrors = validateTimelineEvent(updateData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: validationErrors.join(", ") },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<ITimelineEvent>("timelines");

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Timeline event not found" },
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
      { success: false, error: "Failed to update timeline event" },
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
        { success: false, error: "Timeline event ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<ITimelineEvent>("timelines");

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Timeline event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Timeline event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timeline event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete timeline event" },
      { status: 500 }
    );
  }
}

function validateTimelineEvent(event: Partial<ITimelineEvent>): string[] {
  const errors: string[] = [];
  
  if (!event.year) errors.push("Year is required");
  if (!event.month) errors.push("Month is required");
  if (!event.day) errors.push("Day is required");
  if (!event.title) errors.push("Title is required");
  if (!event.description) errors.push("Description is required");
  
  return errors;
}
