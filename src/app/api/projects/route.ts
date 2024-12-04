import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  Project,
  ProjectDB,
  ProjectCategory,
  ProjectCategoryDB,
} from "@/app/model/project";

// Omit categoryId from Project since we'll handle it separately
interface ProjectInput extends Omit<Project, "categoryId"> {
  categoryId: string;
}

interface ProjectUpdateInput extends Partial<Omit<Project, "categoryId">> {
  _id: string;
  categoryId?: string;
}

// Create a new project
export async function POST(request: Request) {
  try {
    console.log("Starting POST request for new project");
    const data = (await request.json()) as ProjectInput;
    console.log("Received project data:", data);

    const db = await getDb();
    console.log("Database connection established");

    const project: Omit<ProjectDB, "_id"> = {
      title: data.title,
      description: data.description,
      url: data.url,
      github: data.github,
      imageUrl: data.imageUrl,
      tags: data.tags,
      status: data.status,
      categoryId: new ObjectId(data.categoryId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Attempting to insert project:", project);
    const result = await db
      .collection<ProjectDB>("projects")
      .insertOne(project as ProjectDB);

    console.log("Insert result:", result);

    if (result.acknowledged) {
      console.log("Project inserted successfully, updating category");
      // Add project reference to category
      await db
        .collection<ProjectCategoryDB>("projectCategories")
        .updateOne(
          { _id: new ObjectId(data.categoryId) },
          { $push: { projects: result.insertedId } }
        );

      return NextResponse.json({
        success: true,
        project: { ...project, _id: result.insertedId },
      });
    }

    throw new Error("Failed to insert project");
  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof Error) {
      console.error("Error details:", error);
    }
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// Get all projects or filter by category
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const db = await getDb();

    if (categoryId) {
      const category = await db
        .collection<ProjectCategoryDB>("projectCategories")
        .findOne({ _id: new ObjectId(categoryId) });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      const projects = await db
        .collection<ProjectDB>("projects")
        .find({ categoryId: new ObjectId(categoryId) })
        .toArray();

      return NextResponse.json({
        success: true,
        projects,
        category,
      });
    } else {
      const projects = await db
        .collection<ProjectDB>("projects")
        .find()
        .toArray();

      return NextResponse.json({ success: true, projects });
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// Update a project
export async function PUT(request: Request) {
  try {
    const data = (await request.json()) as ProjectUpdateInput;
    const db = await getDb();

    if (!data._id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const updateData: Partial<ProjectDB> = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.url && { url: data.url }),
      ...(data.github && { github: data.github }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      ...(data.tags && { tags: data.tags }),
      ...(data.status && { status: data.status }),
      ...(data.categoryId && { categoryId: new ObjectId(data.categoryId) }),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<ProjectDB>("projects")
      .updateOne({ _id: new ObjectId(data._id) }, { $set: updateData });

    if (result.acknowledged) {
      // If category changed, update project references
      if (data.categoryId) {
        const project = await db
          .collection<ProjectDB>("projects")
          .findOne({ _id: new ObjectId(data._id) });

        if (project) {
          const oldCategoryId = project.categoryId;
          const newCategoryId = new ObjectId(data.categoryId);

          if (!oldCategoryId.equals(newCategoryId)) {
            // Remove from old category
            await db
              .collection<ProjectCategoryDB>("projectCategories")
              .updateOne(
                { _id: oldCategoryId },
                { $pull: { projects: new ObjectId(data._id) } }
              );

            // Add to new category
            await db
              .collection<ProjectCategoryDB>("projectCategories")
              .updateOne(
                { _id: newCategoryId },
                { $push: { projects: new ObjectId(data._id) } }
              );
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Project updated successfully",
      });
    }

    throw new Error("Failed to update project");
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// Delete a project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const objectId = new ObjectId(id);

    // Get project to find its category
    const project = await db
      .collection<ProjectDB>("projects")
      .findOne({ _id: objectId });

    if (project) {
      // Remove project reference from category
      await db
        .collection<ProjectCategoryDB>("projectCategories")
        .updateOne(
          { _id: project.categoryId },
          { $pull: { projects: objectId } }
        );
    }

    // Delete the project
    const result = await db
      .collection<ProjectDB>("projects")
      .deleteOne({ _id: objectId });

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: "Project deleted successfully",
      });
    }

    throw new Error("Failed to delete project");
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
