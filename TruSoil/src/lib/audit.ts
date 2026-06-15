import { connectDB } from "./mongodb";
import AuditLog from "@/models/AuditLog";

export async function writeAuditLog(
  userId: string,
  action: string,
  resource: string,
  ipAddress: string,
  options?: { resourceId?: string; details?: Record<string, unknown> }
) {
  await connectDB();
  await AuditLog.create({
    userId,
    action,
    resource,
    resourceId: options?.resourceId,
    details: options?.details,
    ipAddress,
    timestamp: new Date(),
  });
}
