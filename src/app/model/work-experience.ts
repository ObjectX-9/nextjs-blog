import mongoose, { Schema } from "mongoose";

export interface IWorkExperienceBase {
  _id?: string;
  company: string;
  companyUrl: string;
  position: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string | null; // null means current position
}

export interface IWorkExperience extends IWorkExperienceBase {
  _id: string;
}

const workExperienceSchema = new Schema<IWorkExperience>(
  {
    company: { type: String, required: true },
    companyUrl: { type: String, required: true },
    position: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const WorkExperience =
  (mongoose.models && mongoose.models.WorkExperience) ||
  mongoose.model<IWorkExperience>("WorkExperience", workExperienceSchema);
