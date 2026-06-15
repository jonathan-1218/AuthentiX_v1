const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TruSoil", function () {
  let contract, owner, other;
  const batchId = "batch_test_001";
  const farmId = "farm_test_001";
  const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test_data"));

  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TruSoil");
    contract = await Factory.deploy();
  });

  it("stores a batch and emits BatchStored", async () => {
    await expect(contract.storeBatch(batchId, farmId, merkleRoot, 87, "A"))
      .to.emit(contract, "BatchStored")
      .withArgs(batchId, merkleRoot, 87, "A", owner.address);
  });

  it("retrieves the stored batch correctly", async () => {
    await contract.storeBatch(batchId, farmId, merkleRoot, 87, "A");
    const [root, score, grade] = await contract.getBatch(batchId);
    expect(root).to.equal(merkleRoot);
    expect(score).to.equal(87n);
    expect(grade).to.equal("A");
  });

  it("verifyBatch returns true for correct root", async () => {
    await contract.storeBatch(batchId, farmId, merkleRoot, 87, "A");
    expect(await contract.verifyBatch(batchId, merkleRoot)).to.be.true;
  });

  it("verifyBatch returns false for tampered root", async () => {
    await contract.storeBatch(batchId, farmId, merkleRoot, 87, "A");
    const tampered = ethers.keccak256(ethers.toUtf8Bytes("tampered"));
    expect(await contract.verifyBatch(batchId, tampered)).to.be.false;
  });

  it("rejects duplicate batchId", async () => {
    await contract.storeBatch(batchId, farmId, merkleRoot, 87, "A");
    await expect(contract.storeBatch(batchId, farmId, merkleRoot, 87, "A"))
      .to.be.revertedWith("TruSoil: batch already stored");
  });

  it("rejects score > 100", async () => {
    await expect(contract.storeBatch(batchId, farmId, merkleRoot, 101, "A"))
      .to.be.revertedWith("TruSoil: score exceeds 100");
  });

  it("non-owner cannot storeBatch", async () => {
    await expect(contract.connect(other).storeBatch(batchId, farmId, merkleRoot, 87, "A"))
      .to.be.revertedWith("TruSoil: caller is not the owner");
  });

  it("tracks totalBatches", async () => {
    expect(await contract.totalBatches()).to.equal(0n);
    await contract.storeBatch(batchId, farmId, merkleRoot, 87, "A");
    expect(await contract.totalBatches()).to.equal(1n);
  });
});
