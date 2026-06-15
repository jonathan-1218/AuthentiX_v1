export type Role = "farmer" | "government_officer" | "admin";
export type Grade = "A+" | "A" | "B" | "C";
export type BatchStatus = "active" | "harvested" | "certified" | "rejected";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export interface ScoreBreakdown {
  score: number;
  weight: number;
  detail: string;
}

export interface ComplianceReport {
  complianceScore: number;
  grade: Grade;
  breakDown: {
    pesticide: ScoreBreakdown;
    pH: ScoreBreakdown;
    moisture: ScoreBreakdown;
    temperature: ScoreBreakdown;
    humidity: ScoreBreakdown;
    continuity: ScoreBreakdown;
  };
  npopCompliant: boolean;
  flagsForReview: string[];
  certificationRecommendation: "APPROVE" | "CONDITIONAL" | "REJECT";
  certificationValidity: string;
}

export interface SensorReading {
  farmId: string;
  batchId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pH: number;
  pesticide: number;
  rain: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
