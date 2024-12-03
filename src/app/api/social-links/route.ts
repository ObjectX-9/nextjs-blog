import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ISocialLink } from "@/app/model/social-link";

// Get all social links
export async function GET() {
  try {
    const db = await getDb();
    const socialLinks = await db
      .collection<ISocialLink>("socialLinks")
      .find()
      .toArray();

    return NextResponse.json({ success: true, socialLinks });
  } catch (error) {
    console.error("Error fetching social links:", error);
    return NextResponse.json(
      { error: "Failed to fetch social links" },
      { status: 500 }
    );
  }
}

// Create a new social link
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    const socialLink = {
      name: data.name,
      icon: data.icon,
      url: data.url,
      bgColor: data.bgColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<ISocialLink>("socialLinks")
      .insertOne(socialLink as ISocialLink);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        socialLink: { ...socialLink, _id: result.insertedId },
      });
    }

    throw new Error("Failed to insert social link");
  } catch (error) {
    console.error("Error creating social link:", error);
    return NextResponse.json(
      { error: "Failed to create social link" },
      { status: 500 }
    );
  }
}

// Update a social link
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    if (!data._id) {
      return NextResponse.json(
        { error: "Social link ID is required" },
        { status: 400 }
      );
    }

    const updateData = {
      ...(data.name && { name: data.name }),
      ...(data.icon && { icon: data.icon }),
      ...(data.url && { url: data.url }),
      ...(data.bgColor && { bgColor: data.bgColor }),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<ISocialLink>("socialLinks")
      .updateOne(
        { _id: new ObjectId(data._id) },
        { $set: updateData }
      );

    if (result.matchedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Social link updated successfully",
      });
    }

    return NextResponse.json(
      { error: "Social link not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error updating social link:", error);
    return NextResponse.json(
      { error: "Failed to update social link" },
      { status: 500 }
    );
  }
}

// Delete a social link
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Social link ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection<ISocialLink>("socialLinks")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Social link deleted successfully",
      });
    }

    return NextResponse.json(
      { error: "Social link not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error deleting social link:", error);
    return NextResponse.json(
      { error: "Failed to delete social link" },
      { status: 500 }
    );
  }
}
