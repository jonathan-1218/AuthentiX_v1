import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMonthlyBlockchainRecord extends Document {
  monthKey: string; // "YYYY-MM"
  merkleRoot: string; // hex string without 0x prefix
  txHash: string; // transaction hash
  gasUsed: number;
  blockNumber: number;
  farmCount: number;
  dailyRootCount: number;
  timestamp: Date;
  createdAt: Date;
}

const MonthlyBlockchainRecordSchema = new Schema<IMonthlyBlockchainRecord>(
  {
    monthKey: { type: String, required: true, unique: true }, // "YYYY-MM"
    merkleRoot: { type: String, required: true },
    txHash: { type: String, required: true },
    gasUsed: { type: Number, required: true },
    blockNumber: { type: Number, required: true },
    farmCount: { type: Number, required: true },
    dailyRootCount: { type: Number, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

MonthlyBlockchainRecordSchema.index({ monthKey: 1 }, { unique: true });

const MonthlyBlockchainRecord: Model<IMonthlyBlockchainRecord> =
  mongoose.models.MonthlyBlockchainRecord ??
  mongoose.model<IMonthlyBlockchainRecord>(
    "MonthlyBlockchainRecord",
    MonthlyBlockchainRecordSchema
  );

export default MonthlyBlockchainRecord;
