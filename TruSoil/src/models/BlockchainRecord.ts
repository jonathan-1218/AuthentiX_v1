import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlockchainRecord extends Document {
  batchId: string;
  merkleRoot: string;
  complianceScore: number;
  grade: "A+" | "A" | "B" | "C";
  blockchainAddress: string;
  transactionHash: string;
  blockNumber: number;
  verified: boolean;
  timestamp: Date;
}

const BlockchainRecordSchema = new Schema<IBlockchainRecord>({
  batchId: { type: String, required: true, unique: true },
  merkleRoot: { type: String, required: true },
  complianceScore: { type: Number, required: true },
  grade: { type: String, enum: ["A+", "A", "B", "C"], required: true },
  blockchainAddress: { type: String, required: true },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  verified: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

BlockchainRecordSchema.index({ batchId: 1 }, { unique: true });
BlockchainRecordSchema.index({ transactionHash: 1 });

const BlockchainRecord: Model<IBlockchainRecord> =
  mongoose.models.BlockchainRecord ??
  mongoose.model<IBlockchainRecord>("BlockchainRecord", BlockchainRecordSchema);

export default BlockchainRecord;
