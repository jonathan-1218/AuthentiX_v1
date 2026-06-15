// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TruSoil
 * @notice Stores Merkle roots of IoT sensor batches for organic certification on Sepolia.
 *         Each batch is identified by a string batchId (UUID). Government officers verify
 *         data integrity by comparing the on-chain Merkle root with a locally recalculated one.
 */
contract TruSoil {
    struct BatchRecord {
        bytes32 merkleRoot;
        uint256 complianceScore; // 0-100
        string grade;            // "A+", "A", "B", "C"
        uint256 timestamp;
        address submittedBy;
        bool exists;
    }

    address public owner;
    mapping(string => BatchRecord) private batches;
    string[] private batchIds;

    event BatchStored(
        string indexed batchId,
        bytes32 merkleRoot,
        uint256 complianceScore,
        string grade,
        address indexed submittedBy
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "TruSoil: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Store a batch certification record on-chain.
     * @param batchId   Unique batch identifier (UUID string)
     * @param farmId    Farm identifier (for event indexing, stored off-chain)
     * @param merkleRoot Keccak256 Merkle root of all sensor readings in this batch
     * @param complianceScore Weighted NPOP compliance score (0-100)
     * @param grade     Certification grade: "A+", "A", "B", or "C"
     */
    function storeBatch(
        string calldata batchId,
        string calldata farmId,
        bytes32 merkleRoot,
        uint256 complianceScore,
        string calldata grade
    ) external onlyOwner {
        require(bytes(batchId).length > 0, "TruSoil: empty batchId");
        require(complianceScore <= 100, "TruSoil: score exceeds 100");
        require(!batches[batchId].exists, "TruSoil: batch already stored");

        batches[batchId] = BatchRecord({
            merkleRoot: merkleRoot,
            complianceScore: complianceScore,
            grade: grade,
            timestamp: block.timestamp,
            submittedBy: msg.sender,
            exists: true
        });

        batchIds.push(batchId);

        emit BatchStored(batchId, merkleRoot, complianceScore, grade, msg.sender);
    }

    /**
     * @notice Retrieve on-chain record for a batch (public — no auth needed for verification).
     */
    function getBatch(string calldata batchId)
        external
        view
        returns (
            bytes32 merkleRoot,
            uint256 complianceScore,
            string memory grade,
            uint256 timestamp,
            address submittedBy
        )
    {
        BatchRecord storage r = batches[batchId];
        require(r.exists, "TruSoil: batch not found");
        return (r.merkleRoot, r.complianceScore, r.grade, r.timestamp, r.submittedBy);
    }

    /**
     * @notice Verify that a given Merkle root matches what is stored on-chain.
     * @return true if the provided root matches the stored root
     */
    function verifyBatch(string calldata batchId, bytes32 claimedRoot)
        external
        view
        returns (bool)
    {
        BatchRecord storage r = batches[batchId];
        require(r.exists, "TruSoil: batch not found");
        return r.merkleRoot == claimedRoot;
    }

    /**
     * @notice Returns total number of certified batches stored.
     */
    function totalBatches() external view returns (uint256) {
        return batchIds.length;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "TruSoil: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
