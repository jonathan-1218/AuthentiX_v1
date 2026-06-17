import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDailyMerkleRoot extends Document {
  farmId: string;
  date: string; // "YYYY-MM-DD"
  merkleRoot: string; // hex string
  readingCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

const DailyMerkleRootSchema = new Schema<IDailyMerkleRoot>(
  {
    farmId: { type: String, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    merkleRoot: { type: String, required: true }, // hex string without 0x prefix
    readingCount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Unique index on farmId + date
DailyMerkleRootSchema.index({ farmId: 1, date: 1 }, { unique: true });
// Index on date for monthly aggregation queries
DailyMerkleRootSchema.index({ date: 1 });

const DailyMerkleRoot: Model<IDailyMerkleRoot> =
  mongoose.models.DailyMerkleRoot ??
  mongoose.model<IDailyMerkleRoot>("DailyMerkleRoot", DailyMerkleRootSchema);

export default DailyMerkleRoot;
