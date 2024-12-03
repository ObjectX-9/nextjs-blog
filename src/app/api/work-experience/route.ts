import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IWorkExperience } from "@/app/model/work-experience";

// Get all work experiences
export async function GET() {
  try {
    const db = await getDb();
    const workExperiences = await db
      .collection<IWorkExperience>("workExperiences")
      .find()
      .toArray();

    return NextResponse.json({ success: true, workExperiences });
  } catch (error) {
    console.error("Error fetching work experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch work experiences" },
      { status: 500 }
    );
  }
}

// Create a new work experience
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    const workExperience = {
      company: data.company,
      companyUrl: data.companyUrl,
      position: data.position,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<IWorkExperience>("workExperiences")
      .insertOne(workExperience as IWorkExperience);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        workExperience: { ...workExperience, _id: result.insertedId },
      });
    }

    throw new Error("Failed to insert work experience");
  } catch (error) {
    console.error("Error creating work experience:", error);
    return NextResponse.json(
      { error: "Failed to create work experience" },
      { status: 500 }
    );
  }
}

// Update a work experience
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const db = await getDb();

    if (!data._id) {
      return NextResponse.json(
        { error: "Work experience ID is required" },
        { status: 400 }
      );
    }

    const updateData = {
      ...(data.company && { company: data.company }),
      ...(data.companyUrl && { companyUrl: data.companyUrl }),
      ...(data.position && { position: data.position }),
      ...(data.description && { description: data.description }),
      ...(data.startDate && { startDate: data.startDate }),
      ...(typeof data.endDate !== 'undefined' && { endDate: data.endDate }),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<IWorkExperience>("workExperiences")
      .updateOne(
        { _id: new ObjectId(data._id) },
        { $set: updateData }
      );

    if (result.matchedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Work experience updated successfully",
      });
    }

    return NextResponse.json(
      { error: "Work experience not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error updating work experience:", error);
    return NextResponse.json(
      { error: "Failed to update work experience" },
      { status: 500 }
    );
  }
}

// Delete a work experience
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Work experience ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection<IWorkExperience>("workExperiences")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Work experience deleted successfully",
      });
    }

    return NextResponse.json(
      { error: "Work experience not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error deleting work experience:", error);
    return NextResponse.json(
      { error: "Failed to delete work experience" },
      { status: 500 }
    );
  }
}
