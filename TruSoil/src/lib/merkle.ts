import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

export interface SensorReading {
  farmId?: string;
  batchId?: string;
  timestamp?: Date | number;
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  pH?: number;
  pesticide?: number;
  rain?: number;
  complianceScore?: number;
  grade?: string;
  blockchainHash?: string;
  onBlockchain?: boolean;
  [key: string]: unknown;
}

/**
 * Build daily Merkle root from sensor readings.
 * Hash each reading as keccak256(JSON.stringify(reading))
 * Build Merkle tree with sortPairs: true
 * Return hex root string (without 0x prefix)
 */
export function buildDailyMerkleRoot(readings: SensorReading[]): string {
  const leaves = readings.map((r) => keccak256(JSON.stringify(r)));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getRoot().toString("hex");
}

/**
 * Build monthly Merkle root from daily roots.
 * dailyRoots is array of hex root strings (one per day, sorted by date)
 * Hash each as keccak256(Buffer.from(root, 'hex'))
 * Build Merkle tree with sortPairs: true
 * Return hex root string (without 0x prefix)
 */
export function buildMonthlyMerkleRoot(dailyRoots: string[]): string {
  const leaves = dailyRoots.map((root) =>
    keccak256(Buffer.from(root, "hex"))
  );
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getRoot().toString("hex");
}

/**
 * Generate Merkle proof path for a single reading within a daily tree.
 * Returns array of hex strings (proof path)
 */
export function generateDailyProof(
  readings: SensorReading[],
  targetReading: SensorReading
): string[] {
  const leaves = readings.map((r) => keccak256(JSON.stringify(r)));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const leaf = keccak256(JSON.stringify(targetReading));
  const proof = tree.getProof(leaf);
  return proof.map((p) => p.data.toString("hex"));
}

/**
 * Generate Merkle proof path for a daily root within the monthly tree.
 * Returns array of hex strings (proof path)
 */
export function generateMonthlyProof(
  dailyRoots: string[],
  targetDailyRoot: string
): string[] {
  const leaves = dailyRoots.map((root) =>
    keccak256(Buffer.from(root, "hex"))
  );
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const leaf = keccak256(Buffer.from(targetDailyRoot, "hex"));
  const proof = tree.getProof(leaf);
  return proof.map((p) => p.data.toString("hex"));
}

// Legacy functions for backward compatibility
export function buildMerkleRoot(records: Record<string, unknown>[]): string {
  const leaves = records.map((r) => keccak256(JSON.stringify(r)));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getRoot().toString("hex");
}

export function buildMerkleTree(records: Record<string, unknown>[]) {
  const leaves = records.map((r) => keccak256(JSON.stringify(r)));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return { tree, root: tree.getRoot().toString("hex") };
}
