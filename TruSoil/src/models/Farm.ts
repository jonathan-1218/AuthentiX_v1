import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFarm extends Document {
  farmId: string;
  farmName: string;
  farmerUserId: string;
  location: { lat: number; lng: number; address?: string };
  cropType: string;
  areaInHectares: number;
  status: "growing" | "harvested" | "processed" | "packaged";
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema<IFarm>(
  {
    farmId: { type: String, required: true, unique: true },
    farmName: { type: String, required: true, trim: true },
    farmerUserId: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },
    cropType: { type: String, required: true },
    areaInHectares: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["growing", "harvested", "processed", "packaged"],
      default: "growing",
    },
  },
  { timestamps: true }
);

FarmSchema.index({ farmId: 1 }, { unique: true });
FarmSchema.index({ farmerUserId: 1 });

const Farm: Model<IFarm> =
  mongoose.models.Farm ?? mongoose.model<IFarm>("Farm", FarmSchema);

export default Farm;
