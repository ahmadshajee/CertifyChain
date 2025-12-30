// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title InstitutionRegistry
 * @dev Registry for managing educational institutions
 * @author CertifyChain Team
 */
contract InstitutionRegistry is Ownable {
    uint256 private _institutionIdCounter;

    // Institution types
    enum InstitutionType { University, College, TrainingCenter, OnlinePlatform, Other }

    // Institution structure
    struct InstitutionDetails {
        uint256 id;
        address walletAddress;
        string name;
        string registrationNumber;
        InstitutionType institutionType;
        string country;
        string website;
        string email;
        bool isVerified;
        bool isActive;
        uint256 registrationDate;
        uint256 verificationDate;
        string logoIPFS;
    }

    // Verification request structure
    struct VerificationRequest {
        uint256 institutionId;
        address requestedBy;
        uint256 requestDate;
        string documentIPFS; // Supporting documents
        bool isPending;
        bool isApproved;
        string rejectionReason;
    }

    // Mappings
    mapping(uint256 => InstitutionDetails) public institutionsById;
    mapping(address => uint256) public institutionIdByAddress;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(string => bool) public registrationNumberExists;
    
    // Arrays for enumeration
    uint256[] public allInstitutionIds;
    uint256[] public pendingVerifications;

    // Events
    event InstitutionRegistered(
        uint256 indexed institutionId,
        address indexed walletAddress,
        string name,
        uint256 timestamp
    );
    event VerificationRequested(
        uint256 indexed institutionId,
        uint256 timestamp
    );
    event InstitutionVerified(
        uint256 indexed institutionId,
        uint256 timestamp
    );
    event VerificationRejected(
        uint256 indexed institutionId,
        string reason,
        uint256 timestamp
    );
    event InstitutionDeactivated(
        uint256 indexed institutionId,
        uint256 timestamp
    );
    event InstitutionReactivated(
        uint256 indexed institutionId,
        uint256 timestamp
    );
    event InstitutionUpdated(
        uint256 indexed institutionId,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new institution
     */
    function registerInstitution(
        string memory name,
        string memory registrationNumber,
        InstitutionType institutionType,
        string memory country,
        string memory website,
        string memory email,
        string memory logoIPFS
    ) external returns (uint256) {
        require(institutionIdByAddress[msg.sender] == 0, "Already registered");
        require(!registrationNumberExists[registrationNumber], "Registration number exists");
        require(bytes(name).length > 0, "Name required");
        require(bytes(registrationNumber).length > 0, "Registration number required");
        require(bytes(email).length > 0, "Email required");

        _institutionIdCounter++;
        uint256 newId = _institutionIdCounter;

        institutionsById[newId] = InstitutionDetails({
            id: newId,
            walletAddress: msg.sender,
            name: name,
            registrationNumber: registrationNumber,
            institutionType: institutionType,
            country: country,
            website: website,
            email: email,
            isVerified: false,
            isActive: true,
            registrationDate: block.timestamp,
            verificationDate: 0,
            logoIPFS: logoIPFS
        });

        institutionIdByAddress[msg.sender] = newId;
        registrationNumberExists[registrationNumber] = true;
        allInstitutionIds.push(newId);

        emit InstitutionRegistered(newId, msg.sender, name, block.timestamp);

        return newId;
    }

    /**
     * @dev Request verification for an institution
     */
    function requestVerification(string memory documentIPFS) external {
        uint256 institutionId = institutionIdByAddress[msg.sender];
        require(institutionId != 0, "Not registered");
        require(!institutionsById[institutionId].isVerified, "Already verified");
        require(!verificationRequests[institutionId].isPending, "Request pending");

        verificationRequests[institutionId] = VerificationRequest({
            institutionId: institutionId,
            requestedBy: msg.sender,
            requestDate: block.timestamp,
            documentIPFS: documentIPFS,
            isPending: true,
            isApproved: false,
            rejectionReason: ""
        });

        pendingVerifications.push(institutionId);

        emit VerificationRequested(institutionId, block.timestamp);
    }

    /**
     * @dev Approve verification request (owner only)
     */
    function approveVerification(uint256 institutionId) external onlyOwner {
        require(verificationRequests[institutionId].isPending, "No pending request");

        institutionsById[institutionId].isVerified = true;
        institutionsById[institutionId].verificationDate = block.timestamp;
        verificationRequests[institutionId].isPending = false;
        verificationRequests[institutionId].isApproved = true;

        _removePendingVerification(institutionId);

        emit InstitutionVerified(institutionId, block.timestamp);
    }

    /**
     * @dev Reject verification request (owner only)
     */
    function rejectVerification(uint256 institutionId, string memory reason) external onlyOwner {
        require(verificationRequests[institutionId].isPending, "No pending request");

        verificationRequests[institutionId].isPending = false;
        verificationRequests[institutionId].isApproved = false;
        verificationRequests[institutionId].rejectionReason = reason;

        _removePendingVerification(institutionId);

        emit VerificationRejected(institutionId, reason, block.timestamp);
    }

    /**
     * @dev Deactivate an institution (owner only)
     */
    function deactivateInstitution(uint256 institutionId) external onlyOwner {
        require(institutionsById[institutionId].isActive, "Already inactive");

        institutionsById[institutionId].isActive = false;

        emit InstitutionDeactivated(institutionId, block.timestamp);
    }

    /**
     * @dev Reactivate an institution (owner only)
     */
    function reactivateInstitution(uint256 institutionId) external onlyOwner {
        require(!institutionsById[institutionId].isActive, "Already active");

        institutionsById[institutionId].isActive = true;

        emit InstitutionReactivated(institutionId, block.timestamp);
    }

    /**
     * @dev Update institution details
     */
    function updateInstitution(
        string memory website,
        string memory email,
        string memory logoIPFS
    ) external {
        uint256 institutionId = institutionIdByAddress[msg.sender];
        require(institutionId != 0, "Not registered");

        if (bytes(website).length > 0) {
            institutionsById[institutionId].website = website;
        }
        if (bytes(email).length > 0) {
            institutionsById[institutionId].email = email;
        }
        if (bytes(logoIPFS).length > 0) {
            institutionsById[institutionId].logoIPFS = logoIPFS;
        }

        emit InstitutionUpdated(institutionId, block.timestamp);
    }

    /**
     * @dev Get institution by address
     */
    function getInstitutionByAddress(address walletAddress) external view returns (InstitutionDetails memory) {
        uint256 id = institutionIdByAddress[walletAddress];
        require(id != 0, "Institution not found");
        return institutionsById[id];
    }

    /**
     * @dev Get all verified institutions
     */
    function getVerifiedInstitutions() external view returns (InstitutionDetails[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allInstitutionIds.length; i++) {
            if (institutionsById[allInstitutionIds[i]].isVerified && institutionsById[allInstitutionIds[i]].isActive) {
                count++;
            }
        }

        InstitutionDetails[] memory verified = new InstitutionDetails[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allInstitutionIds.length; i++) {
            if (institutionsById[allInstitutionIds[i]].isVerified && institutionsById[allInstitutionIds[i]].isActive) {
                verified[index] = institutionsById[allInstitutionIds[i]];
                index++;
            }
        }

        return verified;
    }

    /**
     * @dev Get pending verification requests
     */
    function getPendingVerifications() external view returns (VerificationRequest[] memory) {
        VerificationRequest[] memory pending = new VerificationRequest[](pendingVerifications.length);
        for (uint256 i = 0; i < pendingVerifications.length; i++) {
            pending[i] = verificationRequests[pendingVerifications[i]];
        }
        return pending;
    }

    /**
     * @dev Check if address is verified institution
     */
    function isVerified(address walletAddress) external view returns (bool) {
        uint256 id = institutionIdByAddress[walletAddress];
        if (id == 0) return false;
        return institutionsById[id].isVerified && institutionsById[id].isActive;
    }

    /**
     * @dev Get total institution count
     */
    function getTotalInstitutions() external view returns (uint256) {
        return _institutionIdCounter;
    }

    /**
     * @dev Internal function to remove from pending verifications
     */
    function _removePendingVerification(uint256 institutionId) internal {
        for (uint256 i = 0; i < pendingVerifications.length; i++) {
            if (pendingVerifications[i] == institutionId) {
                pendingVerifications[i] = pendingVerifications[pendingVerifications.length - 1];
                pendingVerifications.pop();
                break;
            }
        }
    }
}
