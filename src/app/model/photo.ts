import mongoose, { Schema } from "mongoose";
import { Tags } from 'exiftool-vendored'


export interface IPhoto {
  _id?: string;
  src: string;
  width: number;
  height: number;
  title: string;
  location: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  exif: Tags;
}

const photoSchema = new Schema<IPhoto>(
  {
    src: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Photo =
  mongoose.models.Photo || mongoose.model<IPhoto>("Photo", photoSchema);
