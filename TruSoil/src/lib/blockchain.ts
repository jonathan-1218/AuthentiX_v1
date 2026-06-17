import { ethers } from "ethers";
import { connectDB } from "./mongodb";
import MonthlyBlockchainRecord from "@/models/MonthlyBlockchainRecord";

const ABI = [
  "function storeMonthlyRoot(string monthKey, bytes32 merkleRoot, uint16 year, uint8 month, uint16 farmCount, uint8 dailyRootCount) external",
  "function getMonthlyRoot(string monthKey) external view returns (bytes32 merkleRoot, uint16 year, uint8 month, uint16 farmCount, uint8 dailyRootCount, uint256 timestamp, address submittedBy)",
  "function verifyMonthlyRoot(string monthKey, bytes32 claimedRoot) external view returns (bool)",
  "function totalMonths() external view returns (uint256)",
  "event MonthlyRootStored(string indexed monthKey, bytes32 merkleRoot, uint16 year, uint8 month, uint16 farmCount, uint8 dailyRootCount, address indexed submittedBy)",
];

function getContract() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);
  return new ethers.Contract(process.env.CONTRACT_ADDRESS!, ABI, wallet);
}

export async function storeMonthlyRootOnChain(params: {
  monthKey: string;
  merkleRoot: string;
  year: number;
  month: number;
  farmCount: number;
  dailyRootCount: number;
}) {
  const contract = getContract();
  const rootBytes = `0x${params.merkleRoot.padStart(64, "0")}` as `0x${string}`;

  const tx = await contract.storeMonthlyRoot(
    params.monthKey,
    rootBytes,
    params.year,
    params.month,
    params.farmCount,
    params.dailyRootCount
  );

  const receipt = await tx.wait();

  await connectDB();
  await MonthlyBlockchainRecord.create({
    monthKey: params.monthKey,
    merkleRoot: params.merkleRoot,
    txHash: receipt.hash,
    gasUsed: Number(receipt.gasUsed),
    blockNumber: receipt.blockNumber,
    farmCount: params.farmCount,
    dailyRootCount: params.dailyRootCount,
    timestamp: new Date(),
  });

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
  };
}

export async function verifyMonthlyRoot(monthKey: string): Promise<{
  merkleRoot: string;
  year: number;
  month: number;
  farmCount: number;
  dailyRootCount: number;
  timestamp: number;
} | null> {
  try {
    const contract = getContract();
    const result = await contract.getMonthlyRoot(monthKey);
    return {
      merkleRoot: result[0].replace("0x", "").replace(/0+$/, ""),
      year: Number(result[1]),
      month: Number(result[2]),
      farmCount: Number(result[3]),
      dailyRootCount: Number(result[4]),
      timestamp: Number(result[5]),
    };
  } catch {
    return null;
  }
}
