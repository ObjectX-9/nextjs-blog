import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from "mongodb";

export interface Project {
  title: string;
  description: string;
  url?: string;
  github?: string;
  imageUrl?: string;
  tags: string[];
  status: "completed" | "in-progress" | "planned";
  categoryId: ObjectId;
}

export interface ProjectDB extends Omit<Project, "_id"> {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCategory {
  name: string;
  description: string;
  projects: ObjectId[];
}

export interface ProjectCategoryDB extends Omit<ProjectCategory, "_id"> {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  url?: string;
  github?: string;
  imageUrl?: string;
  tags: string[];
  status: "completed" | "in-progress" | "planned";
  categoryId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectCategory extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  projects: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String },
  github: { type: String },
  imageUrl: { type: String },
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ["completed", "in-progress", "planned"],
    required: true 
  },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ProjectCategory', required: true }
}, {
  timestamps: true
});

const projectCategorySchema = new Schema<IProjectCategory>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
}, {
  timestamps: true
});

// Check if models exist before creating new ones
export const Project = (mongoose.models && mongoose.models.Project) || mongoose.model<IProject>('Project', projectSchema);
export const ProjectCategory = (mongoose.models && mongoose.models.ProjectCategory) || mongoose.model<IProjectCategory>('ProjectCategory', projectCategorySchema);
