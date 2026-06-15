import { ethers } from "ethers";
import { connectDB } from "./mongodb";
import BlockchainRecord from "@/models/BlockchainRecord";
import type { Grade } from "@/types";

const ABI = [
  "function storeBatch(string farmId, string batchId, bytes32 merkleRoot, uint256 complianceScore, string grade) external",
  "function getBatch(string batchId) external view returns (bytes32 merkleRoot, uint256 complianceScore, string grade, uint256 timestamp)",
  "event BatchStored(string indexed batchId, bytes32 merkleRoot, uint256 complianceScore, string grade)",
];

function getContract() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);
  return new ethers.Contract(process.env.CONTRACT_ADDRESS!, ABI, wallet);
}

export async function uploadToBlockchain(params: {
  farmId: string;
  batchId: string;
  merkleRoot: string;
  complianceScore: number;
  grade: Grade;
}) {
  const contract = getContract();
  const rootBytes = `0x${params.merkleRoot.padEnd(64, "0")}` as `0x${string}`;

  const tx = await contract.storeBatch(
    params.farmId,
    params.batchId,
    rootBytes,
    params.complianceScore,
    params.grade
  );

  const receipt = await tx.wait();

  await connectDB();
  await BlockchainRecord.create({
    batchId: params.batchId,
    merkleRoot: params.merkleRoot,
    complianceScore: params.complianceScore,
    grade: params.grade,
    blockchainAddress: process.env.CONTRACT_ADDRESS!,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    verified: true,
    timestamp: new Date(),
  });

  return { transactionHash: receipt.hash, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed.toString() };
}

export async function verifyOnChain(batchId: string): Promise<{
  merkleRoot: string;
  complianceScore: number;
  grade: string;
  timestamp: number;
} | null> {
  try {
    const contract = getContract();
    const result = await contract.getBatch(batchId);
    return {
      merkleRoot: result[0].replace("0x", "").replace(/0+$/, ""),
      complianceScore: Number(result[1]),
      grade: result[2],
      timestamp: Number(result[3]),
    };
  } catch {
    return null;
  }
}
