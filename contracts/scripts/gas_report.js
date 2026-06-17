const { ethers } = require("hardhat");

async function main() {
  const Factory = await ethers.getContractFactory("TruSoil");

  // Deploy and capture receipt
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const deployReceipt = await ethers.provider.getTransactionReceipt(
    contract.deploymentTransaction().hash
  );

  // Measure storeMonthlyRoot gas
  const root = ethers.keccak256(ethers.toUtf8Bytes("june-2025-test"));
  const storeTx = await contract.storeMonthlyRoot("2025-06", root, 2025, 6, 12, 30);
  const storeReceipt = await storeTx.wait();

  const GWEI = 20n;
  const WEI_PER_GWEI = 1_000_000_000n;
  const WEI_PER_ETH  = 1_000_000_000_000_000_000n;

  const deployGas = BigInt(deployReceipt.gasUsed);
  const storeGas  = BigInt(storeReceipt.gasUsed);
  const deployWei = deployGas * GWEI * WEI_PER_GWEI;
  const storeWei  = storeGas  * GWEI * WEI_PER_GWEI;
  const annualWei = storeWei  * 12n;
  const fmt = (wei) => (Number(wei) / Number(WEI_PER_ETH)).toFixed(8);

  console.log("\n========== TruSoil Gas Report ==========");
  console.log(`Deployment gas used      : ${deployGas.toLocaleString()} gas`);
  console.log(`Deployment cost @20 gwei : ${fmt(deployWei)} ETH`);
  console.log(`storeMonthlyRoot gas     : ${storeGas.toLocaleString()} gas`);
  console.log(`storeMonthlyRoot @20gwei : ${fmt(storeWei)} ETH`);
  console.log(`Annual (12 calls) @20gwi : ${fmt(annualWei)} ETH`);
  console.log(`Sepolia contract         : 0x3B1436586a0489A85e6aBd727f752bb957126797`);
  console.log(`Sepolia Etherscan        : https://sepolia.etherscan.io/address/0x3B1436586a0489A85e6aBd727f752bb957126797`);
  console.log("=========================================\n");
}

main().catch(console.error);
