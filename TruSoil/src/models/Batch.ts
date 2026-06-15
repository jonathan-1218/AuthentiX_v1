import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBatch extends Document {
  batchId: string;
  farmId: string;
  batchName: string;
  startDate: Date;
  endDate?: Date;
  status: "active" | "harvested" | "certified" | "rejected";
  overallScore: number;
  overallGrade: "A+" | "A" | "B" | "C";
  approvalStatus: "pending" | "approved" | "rejected";
  governmentOfficerId?: string;
  qrCode?: string;
  blockchainAddress?: string;
  dataPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    batchId: { type: String, required: true, unique: true },
    farmId: { type: String, required: true },
    batchName: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "harvested", "certified", "rejected"],
      default: "active",
    },
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    overallGrade: { type: String, enum: ["A+", "A", "B", "C"], default: "C" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    governmentOfficerId: { type: String },
    qrCode: { type: String },
    blockchainAddress: { type: String },
    dataPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BatchSchema.index({ batchId: 1 }, { unique: true });
BatchSchema.index({ farmId: 1 });
BatchSchema.index({ governmentOfficerId: 1 });
BatchSchema.index({ approvalStatus: 1 });

const Batch: Model<IBatch> =
  mongoose.models.Batch ?? mongoose.model<IBatch>("Batch", BatchSchema);

export default Batch;
