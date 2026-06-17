const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TruSoil", function () {
  let contract, owner, other;

  const MONTH_KEY   = "2025-06";
  const MONTH_KEY_2 = "2025-07";
  const ROOT        = ethers.keccak256(ethers.toUtf8Bytes("daily-roots-june-2025"));
  const ROOT_2      = ethers.keccak256(ethers.toUtf8Bytes("daily-roots-july-2025"));

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TruSoil");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ── Deployment ───────────────────────────────────────────────────────────────

  it("sets deployer as owner", async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("starts with zero monthly records", async function () {
    expect(await contract.totalMonths()).to.equal(0n);
  });

  // ── storeMonthlyRoot ─────────────────────────────────────────────────────────

  it("stores a monthly root and emits MonthlyRootStored", async function () {
    await expect(
      contract.storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 6, 12, 30)
    )
      .to.emit(contract, "MonthlyRootStored")
      .withArgs(MONTH_KEY, ROOT, 2025, 6, 12, 30, owner.address);

    expect(await contract.totalMonths()).to.equal(1n);
  });

  it("rejects duplicate monthKey", async function () {
    await contract.storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 6, 12, 30);
    await expect(
      contract.storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 6, 12, 30)
    ).to.be.revertedWith("TruSoil: month already stored");
  });

  it("rejects empty monthKey", async function () {
    await expect(
      contract.storeMonthlyRoot("", ROOT, 2025, 6, 5, 20)
    ).to.be.revertedWith("TruSoil: empty monthKey");
  });

  it("rejects invalid month (0)", async function () {
    await expect(
      contract.storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 0, 5, 20)
    ).to.be.revertedWith("TruSoil: invalid month");
  });

  it("rejects invalid month (13)", async function () {
    await expect(
      contract.storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 13, 5, 20)
    ).to.be.revertedWith("TruSoil: invalid month");
  });

  it("reverts when called by non-owner", async function () {
    await expect(
      contract.connect(other).storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 6, 5, 20)
    ).to.be.revertedWith("TruSoil: caller is not the owner");
  });

  it("stores multiple months and counts them correctly", async function () {
    await contract.storeMonthlyRoot(MONTH_KEY,   ROOT,   2025, 6, 10, 28);
    await contract.storeMonthlyRoot(MONTH_KEY_2, ROOT_2, 2025, 7, 11, 31);
    expect(await contract.totalMonths()).to.equal(2n);
  });

  // ── getMonthlyRoot ───────────────────────────────────────────────────────────

  it("retrieves stored monthly root with correct fields", async function () {
    await contract.storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 6, 12, 30);
    const [merkleRoot, year, month, farmCount, dailyRootCount, timestamp, submittedBy] =
      await contract.getMonthlyRoot(MONTH_KEY);

    expect(merkleRoot).to.equal(ROOT);
    expect(year).to.equal(2025);
    expect(month).to.equal(6);
    expect(farmCount).to.equal(12);
    expect(dailyRootCount).to.equal(30);
    expect(timestamp).to.be.gt(0n);
    expect(submittedBy).to.equal(owner.address);
  });

  it("reverts getMonthlyRoot for unknown key", async function () {
    await expect(
      contract.getMonthlyRoot("2099-01")
    ).to.be.revertedWith("TruSoil: month not found");
  });

  // ── verifyMonthlyRoot ────────────────────────────────────────────────────────

  it("returns true when claimed root matches stored root", async function () {
    await contract.storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 6, 12, 30);
    expect(await contract.verifyMonthlyRoot(MONTH_KEY, ROOT)).to.be.true;
  });

  it("returns false when claimed root does not match", async function () {
    await contract.storeMonthlyRoot(MONTH_KEY, ROOT, 2025, 6, 12, 30);
    const fakeRoot = ethers.keccak256(ethers.toUtf8Bytes("tampered"));
    expect(await contract.verifyMonthlyRoot(MONTH_KEY, fakeRoot)).to.be.false;
  });

  it("reverts verifyMonthlyRoot for unknown key", async function () {
    await expect(
      contract.verifyMonthlyRoot("2099-01", ROOT)
    ).to.be.revertedWith("TruSoil: month not found");
  });

  // ── transferOwnership ────────────────────────────────────────────────────────

  it("transfers ownership and emits OwnershipTransferred", async function () {
    await expect(contract.transferOwnership(other.address))
      .to.emit(contract, "OwnershipTransferred")
      .withArgs(owner.address, other.address);
    expect(await contract.owner()).to.equal(other.address);
  });

  it("reverts transferOwnership to zero address", async function () {
    await expect(
      contract.transferOwnership(ethers.ZeroAddress)
    ).to.be.revertedWith("TruSoil: zero address");
  });

  it("reverts transferOwnership when called by non-owner", async function () {
    await expect(
      contract.connect(other).transferOwnership(other.address)
    ).to.be.revertedWith("TruSoil: caller is not the owner");
  });
});
