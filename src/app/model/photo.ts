import mongoose, { Schema, Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IPhoto {
  src: string;
  width: number;
  height: number;
  title: string;
  location: string;
  date: string;
}

export interface IPhotoDB extends Omit<IPhoto, "_id"> {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhotoDB>(
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
  mongoose.models.Photo || mongoose.model<IPhotoDB>("Photo", photoSchema);
