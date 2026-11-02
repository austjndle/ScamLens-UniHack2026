const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ScamReportRegistry Smart Contract", function () {
  let registry;
  let owner, user1, user2, moderator;

  beforeEach(async function () {
    [owner, user1, user2, moderator] = await ethers.getSigners();

    const ScamReportRegistry = await ethers.getContractFactory("ScamReportRegistry");
    registry = await ScamReportRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("should deploy with the correct owner and initial totalReports of 0", async function () {
    expect(await registry.owner()).to.equal(owner.address);
    expect(await registry.totalReports()).to.equal(0n);
    expect(await registry.moderators(owner.address)).to.equal(true);
  });

  it("should allow a user to submit a salted commitment report without storing raw PII", async function () {
    const rawContent = "Vietcombank locked account urgent call 1900xxxx";
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(rawContent));
    const salt = ethers.randomBytes(32);
    
    // Commitment = keccak256(contentHash, salt, reporter)
    const packed = ethers.solidityPacked(
      ["bytes32", "bytes32", "address"],
      [contentHash, salt, user1.address]
    );
    const commitment = ethers.keccak256(packed);

    const tx = await registry.connect(user1).submitReport(
      commitment,
      0, // FakeBankSupport
      95, // Risk score
      "ipfs://bafkreiapplepie123"
    );
    await tx.wait();

    expect(await registry.totalReports()).to.equal(1n);

    const report = await registry.reports(1);
    expect(report.commitment).to.equal(commitment);
    expect(report.category).to.equal(0n);
    expect(report.riskScore).to.equal(95n);
    expect(report.reporter).to.equal(user1.address);
    expect(report.status).to.equal(0n); // Submitted

    // Verify commitment calculation on-chain
    const isValid = await registry.verifyCommitment(1, contentHash, salt);
    expect(isValid).to.equal(true);

    // Verify with invalid salt fails
    const invalidSalt = ethers.randomBytes(32);
    const isInvalid = await registry.verifyCommitment(1, contentHash, invalidSalt);
    expect(isInvalid).to.equal(false);
  });

  it("should prevent duplicate commitment submissions", async function () {
    const commitment = ethers.keccak256(ethers.toUtf8Bytes("fixed-sample-commitment"));

    await registry.connect(user1).submitReport(commitment, 1, 80, "");
    
    await expect(
      registry.connect(user2).submitReport(commitment, 1, 80, "")
    ).to.be.revertedWith("Report commitment already registered");
  });

  it("should reject invalid inputs (empty commitment or risk score > 100)", async function () {
    const emptyCommitment = ethers.ZeroHash;
    await expect(
      registry.connect(user1).submitReport(emptyCommitment, 0, 50, "")
    ).to.be.revertedWith("Commitment cannot be empty");

    const validCommitment = ethers.keccak256(ethers.toUtf8Bytes("test"));
    await expect(
      registry.connect(user1).submitReport(validCommitment, 0, 101, "")
    ).to.be.revertedWith("Risk score must be 0-100");
  });

  it("should allow an affected party to dispute a report", async function () {
    const commitment = ethers.keccak256(ethers.toUtf8Bytes("commitment-dispute-test"));
    await registry.connect(user1).submitReport(commitment, 2, 85, "");

    const disputeReasonHash = ethers.keccak256(ethers.toUtf8Bytes("Legitimate enterprise, report is false"));
    
    const tx = await registry.connect(user2).disputeReport(1, disputeReasonHash);
    await tx.wait();

    const report = await registry.reports(1);
    expect(report.status).to.equal(1n); // Disputed
    expect(await registry.getDisputesCount(1)).to.equal(1n);
  });

  it("should allow designated moderators to update status to Verified or Dismissed", async function () {
    const commitment = ethers.keccak256(ethers.toUtf8Bytes("mod-test"));
    await registry.connect(user1).submitReport(commitment, 3, 90, "");

    // Grant moderator role
    await registry.connect(owner).setModerator(moderator.address, true);
    expect(await registry.moderators(moderator.address)).to.equal(true);

    // Moderator verifies report
    await registry.connect(moderator).updateReportStatus(1, 2); // Verified
    expect((await registry.reports(1)).status).to.equal(2n);

    // Non-moderator cannot update status
    await expect(
      registry.connect(user2).updateReportStatus(1, 3)
    ).to.be.revertedWith("Not authorized moderator");
  });

  it("should support paginated retrieval of recent reports", async function () {
    for (let i = 1; i <= 5; i++) {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(`entry-${i}`));
      await registry.connect(user1).submitReport(commitment, 0, 70 + i, "");
    }

    expect(await registry.totalReports()).to.equal(5n);

    const [recentReports, nextOffset] = await registry.getRecentReports(0, 3);
    expect(recentReports.length).to.equal(3);
    expect(nextOffset).to.equal(3n);
    expect(recentReports[0].riskScore).to.equal(75n);
    expect(recentReports[1].riskScore).to.equal(74n);
  });
});
