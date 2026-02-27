// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgriTrace
 * @author AgriChain Team
 * @notice ERC-721 based supply chain traceability contract for agricultural produce.
 *         Each NFT token represents a unique produce batch (e.g., cashews, tomatoes).
 *         Stakeholders update journey steps; ownership transfers through the chain.
 */
contract AgriTrace is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;    // current token ID (starts at 0, incremented before mint)

    // ─── Enums ────────────────────────────────────────────────────────────────
    enum BatchStatus {
        Harvested,      // 0 – Just created by farmer
        Processing,     // 1 – At processing facility
        InTransit,      // 2 – Being transported
        AtWarehouse,    // 3 – Stored in warehouse
        AtRetailer,     // 4 – With retailer
        Sold,           // 5 – Sold to consumer
        Rejected        // 6 – Quality rejected
    }

    // ─── Structs ──────────────────────────────────────────────────────────────
    struct QualityMetrics {
        uint8  moisturePercent;   // 0–100
        uint8  gradeScore;        // 1–10
        string certifications;    // e.g., "FSSAI,Organic"
        bool   pesticidesUsed;
    }

    struct JourneyStep {
        address     updatedBy;
        BatchStatus status;
        string      location;
        string      notes;
        string      ipfsHash;     // Step-specific document/image
        uint256     timestamp;
    }

    struct BatchInfo {
        uint256        tokenId;
        address        farmer;
        string         cropType;
        string         origin;        // e.g., "Nashik, Maharashtra"
        uint256        harvestTimestamp;
        uint32         quantityKg;
        QualityMetrics quality;
        string         ipfsHash;      // Main batch document
        bool           exists;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────
    mapping(uint256 => BatchInfo)     private _batches;
    mapping(uint256 => JourneyStep[]) private _journeys;
    mapping(address => bool)          public  authorizedStakeholders;



    // ─── Events ───────────────────────────────────────────────────────────────
    event BatchCreated(
        uint256 indexed tokenId,
        address indexed farmer,
        string  cropType,
        string  origin,
        uint256 harvestTimestamp,
        string  ipfsHash
    );

    event BatchUpdated(
        uint256 indexed tokenId,
        address indexed updatedBy,
        BatchStatus     newStatus,
        string          location,
        uint256         timestamp
    );

    event OwnershipTransferred_Batch(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256         timestamp
    );

    event StakeholderAuthorized(address indexed stakeholder, bool authorized);



    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyBatchOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "AgriTrace: Caller is not the batch owner");
        _;
    }

    modifier onlyStakeholderOrOwner(uint256 tokenId) {
        require(
            ownerOf(tokenId) == msg.sender || authorizedStakeholders[msg.sender],
            "AgriTrace: Not authorized to update this batch"
        );
        _;
    }

    modifier batchExists(uint256 tokenId) {
        require(_batches[tokenId].exists, "AgriTrace: Batch does not exist");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────
    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor() ERC721("AgriTrace", "AGT") Ownable(msg.sender) {}

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Farmer mints a new produce batch NFT.
     */
    function createBatch(
        string memory cropType,
        string memory origin,
        uint32        quantityKg,
        uint8         moisturePercent,
        uint8         gradeScore,
        string memory certifications,
        bool          pesticidesUsed,
        string memory ipfsHash
    ) external returns (uint256) {
        require(bytes(cropType).length > 0,  "AgriTrace: Crop type required");
        require(bytes(origin).length > 0,    "AgriTrace: Origin required");
        require(quantityKg > 0,              "AgriTrace: Quantity must be > 0");
        require(gradeScore >= 1 && gradeScore <= 10, "AgriTrace: Grade must be 1-10");
        require(moisturePercent <= 100,      "AgriTrace: Invalid moisture value");

        uint256 tokenId = ++_tokenIdCounter;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsHash)));

        _batches[tokenId] = BatchInfo({
            tokenId:          tokenId,
            farmer:           msg.sender,
            cropType:         cropType,
            origin:           origin,
            harvestTimestamp: block.timestamp,
            quantityKg:       quantityKg,
            quality: QualityMetrics({
                moisturePercent: moisturePercent,
                gradeScore:      gradeScore,
                certifications:  certifications,
                pesticidesUsed:  pesticidesUsed
            }),
            ipfsHash: ipfsHash,
            exists:   true
        });

        // Auto-add harvest step to journey
        _journeys[tokenId].push(JourneyStep({
            updatedBy:  msg.sender,
            status:     BatchStatus.Harvested,
            location:   origin,
            notes:      "Batch created and harvested",
            ipfsHash:   ipfsHash,
            timestamp:  block.timestamp
        }));

        emit BatchCreated(tokenId, msg.sender, cropType, origin, block.timestamp, ipfsHash);
        return tokenId;
    }

    /**
     * @notice Add a supply chain update to an existing batch.
     */
    function addUpdate(
        uint256       tokenId,
        BatchStatus   status,
        string memory location,
        string memory notes,
        string memory ipfsHash
    ) external batchExists(tokenId) onlyStakeholderOrOwner(tokenId) {
        require(bytes(location).length > 0, "AgriTrace: Location required");

        _journeys[tokenId].push(JourneyStep({
            updatedBy:  msg.sender,
            status:     status,
            location:   location,
            notes:      notes,
            ipfsHash:   ipfsHash,
            timestamp:  block.timestamp
        }));

        emit BatchUpdated(tokenId, msg.sender, status, location, block.timestamp);
    }

    /**
     * @notice Transfer batch ownership.
     */
    function transferBatchOwnership(
        uint256 tokenId,
        address newOwner
    ) external batchExists(tokenId) onlyBatchOwner(tokenId) {
        require(newOwner != address(0),   "AgriTrace: Invalid new owner");
        require(newOwner != msg.sender,   "AgriTrace: Cannot transfer to yourself");

        address previousOwner = msg.sender;
        _transfer(msg.sender, newOwner, tokenId);

        emit OwnershipTransferred_Batch(tokenId, previousOwner, newOwner, block.timestamp);
    }

    function getBatch(uint256 tokenId)
        external
        view
        batchExists(tokenId)
        returns (BatchInfo memory)
    {
        return _batches[tokenId];
    }

    function getBatchJourney(uint256 tokenId)
        external
        view
        batchExists(tokenId)
        returns (JourneyStep[] memory)
    {
        return _journeys[tokenId];
    }

    function totalBatches() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function setStakeholderAuthorization(address stakeholder, bool authorized)
        external
        onlyOwner
    {
        require(stakeholder != address(0), "AgriTrace: Invalid address");
        authorizedStakeholders[stakeholder] = authorized;
        emit StakeholderAuthorized(stakeholder, authorized);
    }
}
