// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TruSoil
 * @notice Stores monthly Merkle roots of IoT sensor data for organic certification (Sepolia).
 *         Each month's root is keyed by "YYYY-MM" and covers all daily sub-roots from that period.
 *         Government officers verify integrity by comparing the on-chain root with a locally
 *         recalculated one built from raw sensor readings.
 */
contract TruSoil {
    struct MonthlyRecord {
        bytes32 merkleRoot;
        uint256 timestamp;
        address submittedBy;
        uint16 year;
        uint8  month;
        uint16 farmCount;
        uint8  dailyRootCount;
        bool   exists;
    }

    address public owner;
    mapping(string => MonthlyRecord) private records;
    string[] private monthKeys;

    event MonthlyRootStored(
        string  indexed monthKey,
        bytes32         merkleRoot,
        uint16          year,
        uint8           month,
        uint16          farmCount,
        uint8           dailyRootCount,
        address indexed submittedBy
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "TruSoil: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Store a monthly Merkle root on-chain. Reverts if the month key already exists.
     * @param monthKey       "YYYY-MM" e.g. "2025-06"
     * @param merkleRoot     Monthly Merkle root (keccak256 tree of daily roots)
     * @param year           Full year (e.g. 2025)
     * @param month          Month number 1-12
     * @param farmCount      Number of farms included in this root
     * @param dailyRootCount Number of daily roots that make up this monthly root
     */
    function storeMonthlyRoot(
        string  calldata monthKey,
        bytes32          merkleRoot,
        uint16           year,
        uint8            month,
        uint16           farmCount,
        uint8            dailyRootCount
    ) external onlyOwner {
        require(bytes(monthKey).length > 0,      "TruSoil: empty monthKey");
        require(month >= 1 && month <= 12,        "TruSoil: invalid month");
        require(!records[monthKey].exists,        "TruSoil: month already stored");

        records[monthKey] = MonthlyRecord({
            merkleRoot:     merkleRoot,
            timestamp:      block.timestamp,
            submittedBy:    msg.sender,
            year:           year,
            month:          month,
            farmCount:      farmCount,
            dailyRootCount: dailyRootCount,
            exists:         true
        });

        monthKeys.push(monthKey);

        emit MonthlyRootStored(
            monthKey, merkleRoot, year, month, farmCount, dailyRootCount, msg.sender
        );
    }

    /**
     * @notice Retrieve the full on-chain record for a month.
     */
    function getMonthlyRoot(string calldata monthKey)
        external
        view
        returns (
            bytes32 merkleRoot,
            uint16  year,
            uint8   month,
            uint16  farmCount,
            uint8   dailyRootCount,
            uint256 timestamp,
            address submittedBy
        )
    {
        MonthlyRecord storage r = records[monthKey];
        require(r.exists, "TruSoil: month not found");
        return (
            r.merkleRoot,
            r.year,
            r.month,
            r.farmCount,
            r.dailyRootCount,
            r.timestamp,
            r.submittedBy
        );
    }

    /**
     * @notice Verify that a claimed Merkle root matches what is stored on-chain.
     * @return true if the provided root matches the stored root for that month
     */
    function verifyMonthlyRoot(string calldata monthKey, bytes32 claimedRoot)
        external
        view
        returns (bool)
    {
        MonthlyRecord storage r = records[monthKey];
        require(r.exists, "TruSoil: month not found");
        return r.merkleRoot == claimedRoot;
    }

    /**
     * @notice Returns the total number of monthly roots stored.
     */
    function totalMonths() external view returns (uint256) {
        return monthKeys.length;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "TruSoil: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
