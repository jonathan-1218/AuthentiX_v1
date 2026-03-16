require("dotenv").config();
const admin = require("firebase-admin");
const { ethers } = require("ethers");
const fs = require("fs");

// ---------- FIREBASE INIT ----------
const serviceAccount = JSON.parse(
  fs.readFileSync("./firebaseKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// ---------- BLOCKCHAIN INIT ----------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abi = [
  "function storeData(uint256,uint256,uint256,uint256)"
];

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);

// ---------- MAIN FUNCTION ----------
async function pushFirebaseToBlockchain() {
  console.log("📡 Reading data from Firebase...");

  // ✅ CORRECT PATH
  const snapshot = await db.ref("sensor_data").once("value");
  const data = snapshot.val();

  if (!data) {
    console.log("❌ No data found in Firebase");
    return;
  }

  for (const key in data) {
    const record = data[key];

    console.log(`🚀 Pushing record ID: ${key}`);

    // Convert floats to integers (Solidity uses uint)
    const temperature = Math.round(record.temperature);
    const humidity = Math.round(record.humidity);
    const soilMoisture = Math.round(record.soil_moisture);
    const rainWater = Math.round(record.rain_sensor);

    const tx = await contract.storeData(
      temperature,
      humidity,
      soilMoisture,
      rainWater
    );

    await tx.wait();

    console.log(`✅ Stored on blockchain: ${key}`);
  }

  console.log("🎉 All Firebase records pushed to blockchain");
}

pushFirebaseToBlockchain();