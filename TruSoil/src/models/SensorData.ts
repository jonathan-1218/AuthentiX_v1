import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISensorData extends Document {
  farmId: string;
  batchId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pH: number;
  pesticide: number;
  rain: number;
  complianceScore: number;
  grade: "A+" | "A" | "B" | "C";
  blockchainHash?: string;
  onBlockchain: boolean;
}

const SensorDataSchema = new Schema<ISensorData>({
  farmId: { type: String, required: true },
  batchId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  temperature: { type: Number, required: true, min: -10, max: 60 },
  humidity: { type: Number, required: true, min: 0, max: 100 },
  soilMoisture: { type: Number, required: true, min: 0, max: 100 },
  pH: { type: Number, required: true, min: 0, max: 14 },
  pesticide: { type: Number, required: true, min: 0, max: 100 },
  rain: { type: Number, required: true, min: 0 },
  complianceScore: { type: Number, default: 0, min: 0, max: 100 },
  grade: { type: String, enum: ["A+", "A", "B", "C"], default: "C" },
  blockchainHash: { type: String },
  onBlockchain: { type: Boolean, default: false },
});

SensorDataSchema.index({ farmId: 1, timestamp: -1 });
SensorDataSchema.index({ batchId: 1, timestamp: -1 });
// TTL: auto-delete after 6 months
SensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

const SensorData: Model<ISensorData> =
  mongoose.models.SensorData ?? mongoose.model<ISensorData>("SensorData", SensorDataSchema);

export default SensorData;
