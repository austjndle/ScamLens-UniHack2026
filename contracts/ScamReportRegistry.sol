// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ScamReportRegistry
 * @notice Transparent, privacy-preserving scam report registry deployed on Avalanche Fuji (43113).
 *
 * PRIVACY GUARANTEES:
 * 1. NEVER stores raw messages, bank account numbers, personal identities, screenshots, or URLs on-chain.
 * 2. Stores a salted cryptographic commitment: keccak256(abi.encodePacked(contentHash, salt, reporterAddress)).
 * 3. Commitments prevent rainbow table / hash-guessing attacks while enabling verifiable zero-knowledge proofs
 *    of existence and timestamping.
 *
 * DISPUTE & MODERATION MODEL:
 * - Reports start with status "Submitted" (Unverified community signal).
 * - Anyone may dispute a report commitment by posting an on-chain dispute statement.
 * - Designated moderators / community arbiters can mark reports as Verified or Rejected after review.
 * - DISCLAIMER: An on-chain report is an unverified user allegation, NOT legal proof of criminal fraud.
 */
contract ScamReportRegistry is Ownable, ReentrancyGuard {
    enum ReportStatus {
        Submitted,  // Initial unverified community report
        Disputed,   // Disputed by an affected party or counterparty
        Verified,   // Confirmed by community reviewers or official alert
        Dismissed   // Deemed inaccurate, abusive, or duplicate
    }

    enum ScamCategory {
        FakeBankSupport,
        FraudulentTransfer,
        PonziInvestment,
        RelativeImpersonation,
        SuspiciousQR,
        PhishingUrl,
        FakeEcommerce,
        UrgentDebtThreat,
        Other
    }

    struct Report {
        bytes32 commitment;       // Salted cryptographic commitment: keccak256(content, salt, reporter)
        ScamCategory category;    // General taxonomy category (no PII)
        uint8 riskScore;          // Heuristic AI assessment score (0-100)
        uint64 timestamp;         // Block timestamp of submission
        address reporter;         // Submitting wallet
        ReportStatus status;      // Moderation / dispute state
        string metadataUri;       // Optional decentralized metadata (IPFS/Arweave CID with redacted summary)
    }

    struct Dispute {
        address disputer;
        bytes32 reasonHash;
        uint64 timestamp;
    }

    // Storage
    uint256 public totalReports;
    mapping(uint256 => Report) public reports;
    mapping(bytes32 => uint256) public commitmentToReportId; // Commitment deduplication
    mapping(uint256 => Dispute[]) private _reportDisputes;
    mapping(address => bool) public moderators;

    // Events
    event ReportSubmitted(
        uint256 indexed reportId,
        bytes32 indexed commitment,
        ScamCategory indexed category,
        uint8 riskScore,
        address reporter,
        uint64 timestamp
    );

    event ReportStatusUpdated(
        uint256 indexed reportId,
        ReportStatus indexed oldStatus,
        ReportStatus indexed newStatus,
        address moderator
    );

    event ReportDisputed(
        uint256 indexed reportId,
        address indexed disputer,
        bytes32 reasonHash,
        uint64 timestamp
    );

    event ModeratorUpdated(address indexed account, bool isModerator);

    modifier onlyModeratorOrOwner() {
        require(msg.sender == owner() || moderators[msg.sender], "Not authorized moderator");
        _;
    }

    constructor() Ownable(msg.sender) {
        moderators[msg.sender] = true;
    }

    /**
     * @notice Submit a privacy-preserving scam report commitment.
     * @param commitment The salted cryptographic commitment bytes32.
     * @param category The high-level category of scam.
     * @param riskScore AI-evaluated risk score (0-100).
     * @param metadataUri Optional IPFS/Arweave URI containing redacted, non-PII educational alert.
     */
    function submitReport(
        bytes32 commitment,
        ScamCategory category,
        uint8 riskScore,
        string calldata metadataUri
    ) external nonReentrant returns (uint256 reportId) {
        require(commitment != bytes32(0), "Commitment cannot be empty");
        require(riskScore <= 100, "Risk score must be 0-100");
        require(commitmentToReportId[commitment] == 0, "Report commitment already registered");

        totalReports++;
        reportId = totalReports;

        reports[reportId] = Report({
            commitment: commitment,
            category: category,
            riskScore: riskScore,
            timestamp: uint64(block.timestamp),
            reporter: msg.sender,
            status: ReportStatus.Submitted,
            metadataUri: metadataUri
        });

        commitmentToReportId[commitment] = reportId;

        emit ReportSubmitted(
            reportId,
            commitment,
            category,
            riskScore,
            msg.sender,
            uint64(block.timestamp)
        );
    }

    /**
     * @notice Verify whether a given plaintext content and salt match an on-chain report.
     * @param reportId The ID of the report.
     * @param contentHash The keccak256 hash of the sanitized content.
     * @param salt The user-held secret random salt (32 bytes).
     * @return isValid True if the commitment matches.
     */
    function verifyCommitment(
        uint256 reportId,
        bytes32 contentHash,
        bytes32 salt
    ) external view returns (bool isValid) {
        require(reportId > 0 && reportId <= totalReports, "Invalid report ID");
        Report memory r = reports[reportId];
        bytes32 expected = keccak256(abi.encodePacked(contentHash, salt, r.reporter));
        return r.commitment == expected;
    }

    /**
     * @notice Dispute a report if an allegation is false or inappropriate.
     * @param reportId The report being contested.
     * @param reasonHash Hash of the dispute explanation statement.
     */
    function disputeReport(uint256 reportId, bytes32 reasonHash) external {
        require(reportId > 0 && reportId <= totalReports, "Invalid report ID");
        Report storage r = reports[reportId];
        require(r.status != ReportStatus.Dismissed, "Report already dismissed");

        _reportDisputes[reportId].push(Dispute({
            disputer: msg.sender,
            reasonHash: reasonHash,
            timestamp: uint64(block.timestamp)
        }));

        ReportStatus oldStatus = r.status;
        r.status = ReportStatus.Disputed;

        emit ReportDisputed(reportId, msg.sender, reasonHash, uint64(block.timestamp));
        emit ReportStatusUpdated(reportId, oldStatus, ReportStatus.Disputed, msg.sender);
    }

    /**
     * @notice Update report status by an authorized community moderator or owner.
     */
    function updateReportStatus(uint256 reportId, ReportStatus newStatus) external onlyModeratorOrOwner {
        require(reportId > 0 && reportId <= totalReports, "Invalid report ID");
        Report storage r = reports[reportId];
        ReportStatus oldStatus = r.status;
        r.status = newStatus;

        emit ReportStatusUpdated(reportId, oldStatus, newStatus, msg.sender);
    }

    /**
     * @notice Grant or revoke moderator status.
     */
    function setModerator(address account, bool isModerator) external onlyOwner {
        require(account != address(0), "Invalid address");
        moderators[account] = isModerator;
        emit ModeratorUpdated(account, isModerator);
    }

    /**
     * @notice Retrieve total disputes count for a report.
     */
    function getDisputesCount(uint256 reportId) external view returns (uint256) {
        require(reportId > 0 && reportId <= totalReports, "Invalid report ID");
        return _reportDisputes[reportId].length;
    }

    /**
     * @notice Paginated retrieval of recent reports for community feed.
     */
    function getRecentReports(uint256 offset, uint256 limit)
        external
        view
        returns (Report[] memory result, uint256 nextOffset)
    {
        if (totalReports == 0 || offset >= totalReports) {
            return (new Report[](0), totalReports);
        }

        uint256 toFetch = limit;
        if (offset + toFetch > totalReports) {
            toFetch = totalReports - offset;
        }

        result = new Report[](toFetch);
        for (uint256 i = 0; i < toFetch; i++) {
            // Newest first
            uint256 id = totalReports - (offset + i);
            result[i] = reports[id];
        }

        nextOffset = offset + toFetch;
    }
}
