const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer :", deployer.address);
  console.log("Balance  :", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("\n❌ Wallet balance is 0. Fund this address from a Sepolia faucet first:");
    console.error(`   https://sepoliafaucet.com  →  ${deployer.address}`);
    process.exit(1);
  }

  console.log("\nDeploying TruSoil...");
  const TruSoil = await ethers.getContractFactory("TruSoil");
  const contract = await TruSoil.deploy();
  await contract.waitForDeployment();

  const address   = await contract.getAddress();
  const deployTx  = contract.deploymentTransaction();
  const receipt   = await ethers.provider.getTransactionReceipt(deployTx.hash);

  console.log("\n══════════════════════════════════════════");
  console.log("✅  DEPLOYMENT COMPLETE");
  console.log("══════════════════════════════════════════");
  console.log("Contract address  :", address);
  console.log("Tx hash           :", deployTx.hash);
  console.log("Gas used          :", receipt.gasUsed.toString());
  console.log("Block number      :", receipt.blockNumber);
  console.log("Etherscan         :", `https://sepolia.etherscan.io/address/${address}`);
  console.log("Tx on Etherscan   :", `https://sepolia.etherscan.io/tx/${deployTx.hash}`);
  console.log("══════════════════════════════════════════");

  // ── Test call: storeMonthlyRoot with dummy data ───────────────────────────
  console.log("\nCalling storeMonthlyRoot with dummy data...");
  const dummyRoot = ethers.keccak256(ethers.toUtf8Bytes("trusoil-test-june-2025"));
  const storeTx   = await contract.storeMonthlyRoot("2025-06", dummyRoot, 2025, 6, 5, 20);
  const storeRcpt = await storeTx.wait();

  console.log("\n── storeMonthlyRoot ──────────────────────");
  console.log("Tx hash    :", storeTx.hash);
  console.log("Gas used   :", storeRcpt.gasUsed.toString());
  console.log("Tx detail  :", `https://sepolia.etherscan.io/tx/${storeTx.hash}`);
  console.log("──────────────────────────────────────────");

  console.log("\nAdd to .env.local:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
