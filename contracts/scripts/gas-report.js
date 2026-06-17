const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 TruSoil Gas Cost Report");
  console.log("=".repeat(60));
  console.log("Deployer:", deployer.address);
  console.log("");

  // Deploy contract and get gas cost
  console.log("📝 Deploying TruSoil contract...");
  const TruSoil = await ethers.getContractFactory("TruSoil");
  const deployTx = await TruSoil.deploy();
  const deployReceipt = await deployTx.deploymentTransaction().wait();

  const deploymentGas = deployReceipt.gasUsed;
  const contractAddress = await deployTx.getAddress();
  
  console.log("✅ TruSoil deployed to:", contractAddress);
  console.log("   Deployment gas used:", deploymentGas.toString());
  console.log("   Deployment gas (formatted):", ethers.formatUnits(deploymentGas, 0), "gas");

  // Calculate deployment cost at different gas prices
  const deploymentCostAt20Gwei = ethers.formatEther(deploymentGas * 20n * 10n ** 9n);
  const deploymentCostAt50Gwei = ethers.formatEther(deploymentGas * 50n * 10n ** 9n);
  const deploymentCostAt100Gwei = ethers.formatEther(deploymentGas * 100n * 10n ** 9n);

  console.log("\n   Deployment costs:");
  console.log("   • At 20 gwei:  ", deploymentCostAt20Gwei, "ETH");
  console.log("   • At 50 gwei:  ", deploymentCostAt50Gwei, "ETH");
  console.log("   • At 100 gwei: ", deploymentCostAt100Gwei, "ETH");

  // Call storeMonthlyRoot with test data
  console.log("\n📊 Calling storeMonthlyRoot...");
  const contract = await ethers.getContractAt("TruSoil", contractAddress);

  const testMerkleRoot = "0x" + "a".repeat(64);
  const txResponse = await contract.storeMonthlyRoot(
    "2025-06",          // monthKey
    testMerkleRoot,     // merkleRoot
    2025,               // year
    6,                  // month
    42,                 // farmCount
    30                  // dailyRootCount
  );

  const txReceipt = await txResponse.wait();
  const functionGas = txReceipt.gasUsed;

  console.log("✅ storeMonthlyRoot executed");
  console.log("   Function gas used:", functionGas.toString());
  console.log("   Function gas (formatted):", ethers.formatUnits(functionGas, 0), "gas");

  // Calculate function costs at different gas prices
  const functionCostAt20Gwei = ethers.formatEther(functionGas * 20n * 10n ** 9n);
  const functionCostAt50Gwei = ethers.formatEther(functionGas * 50n * 10n ** 9n);
  const functionCostAt100Gwei = ethers.formatEther(functionGas * 100n * 10n ** 9n);

  console.log("\n   storeMonthlyRoot costs (per call):");
  console.log("   • At 20 gwei:  ", functionCostAt20Gwei, "ETH");
  console.log("   • At 50 gwei:  ", functionCostAt50Gwei, "ETH");
  console.log("   • At 100 gwei: ", functionCostAt100Gwei, "ETH");

  // Annual cost (12 calls per year)
  const annualCallsAt20Gwei = ethers.formatEther(functionGas * 20n * 10n ** 9n * 12n);
  const annualCallsAt50Gwei = ethers.formatEther(functionGas * 50n * 10n ** 9n * 12n);
  const annualCallsAt100Gwei = ethers.formatEther(functionGas * 100n * 10n ** 9n * 12n);

  console.log("\n   Annual costs (12 calls/year):");
  console.log("   • At 20 gwei:  ", annualCallsAt20Gwei, "ETH");
  console.log("   • At 50 gwei:  ", annualCallsAt50Gwei, "ETH");
  console.log("   • At 100 gwei: ", annualCallsAt100Gwei, "ETH");

  // Total costs (deployment + annual)
  const totalAt20Gwei = ethers.formatEther(
    deploymentGas * 20n * 10n ** 9n + functionGas * 20n * 10n ** 9n * 12n
  );
  const totalAt50Gwei = ethers.formatEther(
    deploymentGas * 50n * 10n ** 9n + functionGas * 50n * 10n ** 9n * 12n
  );
  const totalAt100Gwei = ethers.formatEther(
    deploymentGas * 100n * 10n ** 9n + functionGas * 100n * 10n ** 9n * 12n
  );

  console.log("\n📈 Summary Report");
  console.log("=".repeat(60));
  console.log("Deployment gas cost:   ", deploymentGas.toString(), "gas");
  console.log("storeMonthlyRoot gas:  ", functionGas.toString(), "gas");
  console.log("\nCosts at 20 gwei (typical):");
  console.log("  • Deployment:       ", deploymentCostAt20Gwei, "ETH");
  console.log("  • Per call:         ", functionCostAt20Gwei, "ETH");
  console.log("  • Annual (12 calls):", annualCallsAt20Gwei, "ETH");
  console.log("  • Total year 1:     ", totalAt20Gwei, "ETH");

  console.log("\nCosts at 50 gwei (high):");
  console.log("  • Deployment:       ", deploymentCostAt50Gwei, "ETH");
  console.log("  • Per call:         ", functionCostAt50Gwei, "ETH");
  console.log("  • Annual (12 calls):", annualCallsAt50Gwei, "ETH");
  console.log("  • Total year 1:     ", totalAt50Gwei, "ETH");

  console.log("\nCosts at 100 gwei (peak):");
  console.log("  • Deployment:       ", deploymentCostAt100Gwei, "ETH");
  console.log("  • Per call:         ", functionCostAt100Gwei, "ETH");
  console.log("  • Annual (12 calls):", annualCallsAt100Gwei, "ETH");
  console.log("  • Total year 1:     ", totalAt100Gwei, "ETH");

  console.log("\n🔗 Sepolia Testnet Links:");
  console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log(`https://sepolia.etherscan.io/tx/${txReceipt.hash}`);

  console.log("\n✅ Gas report complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
