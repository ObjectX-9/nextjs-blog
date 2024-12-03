import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IPhoto, IPhotoDB } from "@/app/model/photo";

// Create a new photo
export async function POST(request: Request) {
  try {
    const { photo } = await request.json();
    const db = await getDb();

    const photoToInsert = {
      ...photo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<IPhotoDB>("photos").insertOne(photoToInsert);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        photo: { ...photoToInsert, _id: result.insertedId },
      });
    }

    throw new Error("Failed to insert photo");
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json(
      { error: "Failed to create photo" },
      { status: 500 }
    );
  }
}

// Get all photos
export async function GET(request: Request) {
  try {
    const db = await getDb();
    const photos = await db
      .collection<IPhotoDB>("photos")
      .find()
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({ success: true, photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// Update a photo
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    const { photo } = await request.json();
    const db = await getDb();
    const objectId = new ObjectId(id);

    const result = await db
      .collection<IPhotoDB>("photos")
      .updateOne(
        { _id: objectId },
        {
          $set: {
            ...photo,
            updatedAt: new Date()
          }
        }
      );

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: "Photo updated successfully"
      });
    }

    throw new Error("Failed to update photo");
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}

// Delete a photo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    const objectId = new ObjectId(id);
    const db = await getDb();
    const result = await db
      .collection<IPhotoDB>("photos")
      .deleteOne({ _id: objectId });

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: "Photo deleted successfully"
      });
    }

    throw new Error("Failed to delete photo");
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
