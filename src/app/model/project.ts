import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  url?: string;
  github?: string;
  imageUrl?: string;
  tags: string[];
  status: "completed" | "in-progress" | "planned";
  categoryId: mongoose.Types.ObjectId;
}

export interface IProjectCategory extends Document {
  name: string;
  description: string;
  projects: mongoose.Types.ObjectId[];
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

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);
export const ProjectCategory = mongoose.models.ProjectCategory || mongoose.model<IProjectCategory>('ProjectCategory', projectCategorySchema);
