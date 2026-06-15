const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TruSoil with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const TruSoil = await ethers.getContractFactory("TruSoil");
  const contract = await TruSoil.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ TruSoil deployed to:", address);
  console.log("\nAdd this to your .env.local:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log("\nVerify on Etherscan Sepolia:");
  console.log(`https://sepolia.etherscan.io/address/${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
