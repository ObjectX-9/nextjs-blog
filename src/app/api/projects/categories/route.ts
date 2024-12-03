import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ProjectCategory, ProjectCategoryDB } from "@/app/model/project";

// Create a new category
export async function POST(request: Request) {
  try {
    const data = await request.json() as ProjectCategory;
    const db = await getDb();

    const category: Omit<ProjectCategoryDB, "_id"> = {
      name: data.name,
      description: data.description,
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<ProjectCategoryDB>("projectCategories")
      .insertOne(category as ProjectCategoryDB);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        category: { ...category, _id: result.insertedId },
      });
    }

    throw new Error("Failed to insert category");
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// Get all categories
export async function GET() {
  try {
    const db = await getDb();
    const categories = await db
      .collection<ProjectCategoryDB>("projectCategories")
      .find()
      .toArray();

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// Update a category
export async function PUT(request: Request) {
  try {
    const data = await request.json() as ProjectCategoryDB;
    const db = await getDb();

    if (!data._id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const updateData: Partial<ProjectCategoryDB> = {
      name: data.name,
      description: data.description,
      updatedAt: new Date(),
    };

    const result = await db
      .collection<ProjectCategoryDB>("projectCategories")
      .updateOne(
        { _id: new ObjectId(data._id.toString()) },
        { $set: updateData }
      );

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: "Category updated successfully",
      });
    }

    throw new Error("Failed to update category");
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Delete a category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const objectId = new ObjectId(id);

    // Check if category has projects
    const category = await db
      .collection<ProjectCategoryDB>("projectCategories")
      .findOne({ _id: objectId });

    if (category && category.projects.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with projects. Please remove or reassign projects first.",
        },
        { status: 400 }
      );
    }

    const result = await db
      .collection<ProjectCategoryDB>("projectCategories")
      .deleteOne({ _id: objectId });

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: "Category deleted successfully",
      });
    }

    throw new Error("Failed to delete category");
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
