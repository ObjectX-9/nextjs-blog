import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkExperienceBase {
  company: string;
  companyUrl: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string | null; // null means current position
}

export interface IWorkExperience extends Document, IWorkExperienceBase {}

const workExperienceSchema = new Schema<IWorkExperience>({
  company: { type: String, required: true },
  companyUrl: { type: String, required: true },
  position: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: null }
}, {
  timestamps: true
});

export const WorkExperience = mongoose.models.WorkExperience || mongoose.model<IWorkExperience>('WorkExperience', workExperienceSchema);
