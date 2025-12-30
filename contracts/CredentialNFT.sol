// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CredentialNFT
 * @dev ERC721 token representing academic credentials on the blockchain
 * @author AccredChain Team
 */
contract CredentialNFT is ERC721, ERC721URIStorage, AccessControl {
    // Roles
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Credential status enum
    enum CredentialStatus { Active, Revoked, Expired }

    // Credential structure
    struct Credential {
        uint256 tokenId;
        address institution;
        address student;
        string credentialType; // "degree", "certificate", "diploma"
        string courseName;
        string studentName;
        string studentId;
        uint256 issueDate;
        uint256 expiryDate; // 0 if no expiry
        string ipfsHash; // IPFS hash of the full credential document
        CredentialStatus status;
        string grade;
    }

    // Institution structure
    struct Institution {
        string name;
        string registrationId;
        bool isVerified;
        uint256 registrationDate;
        uint256 credentialsIssued;
    }

    // Mappings
    mapping(uint256 => Credential) public credentials;
    mapping(address => Institution) public institutions;
    mapping(address => uint256[]) public studentCredentials;
    mapping(address => uint256[]) public institutionCredentials;
    mapping(string => uint256) public credentialByHash; // IPFS hash to token ID

    // Events
    event InstitutionRegistered(address indexed institution, string name, uint256 timestamp);
    event InstitutionVerified(address indexed institution, uint256 timestamp);
    event InstitutionRevoked(address indexed institution, uint256 timestamp);
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed institution,
        address indexed student,
        string credentialType,
        uint256 timestamp
    );
    event CredentialRevoked(uint256 indexed tokenId, address indexed institution, uint256 timestamp);
    event CredentialVerified(uint256 indexed tokenId, address indexed verifier, uint256 timestamp);

    // Modifiers
    modifier onlyVerifiedInstitution() {
        require(institutions[msg.sender].isVerified, "Not a verified institution");
        _;
    }

    modifier credentialExists(uint256 tokenId) {
        require(_exists(tokenId), "Credential does not exist");
        _;
    }

    constructor() ERC721("AccredChain Credential", "CERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register a new institution
     * @param name Institution name
     * @param registrationId Official registration ID
     */
    function registerInstitution(
        string memory name,
        string memory registrationId
    ) external {
        require(bytes(institutions[msg.sender].name).length == 0, "Institution already registered");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(registrationId).length > 0, "Registration ID cannot be empty");

        institutions[msg.sender] = Institution({
            name: name,
            registrationId: registrationId,
            isVerified: false,
            registrationDate: block.timestamp,
            credentialsIssued: 0
        });

        emit InstitutionRegistered(msg.sender, name, block.timestamp);
    }

    /**
     * @dev Verify an institution (admin only)
     * @param institutionAddress Address of the institution to verify
     */
    function verifyInstitution(address institutionAddress) external onlyRole(ADMIN_ROLE) {
        require(bytes(institutions[institutionAddress].name).length > 0, "Institution not registered");
        require(!institutions[institutionAddress].isVerified, "Institution already verified");

        institutions[institutionAddress].isVerified = true;
        _grantRole(INSTITUTION_ROLE, institutionAddress);

        emit InstitutionVerified(institutionAddress, block.timestamp);
    }

    /**
     * @dev Revoke institution verification (admin only)
     * @param institutionAddress Address of the institution to revoke
     */
    function revokeInstitution(address institutionAddress) external onlyRole(ADMIN_ROLE) {
        require(institutions[institutionAddress].isVerified, "Institution not verified");

        institutions[institutionAddress].isVerified = false;
        _revokeRole(INSTITUTION_ROLE, institutionAddress);

        emit InstitutionRevoked(institutionAddress, block.timestamp);
    }

    /**
     * @dev Issue a new credential (verified institutions only)
     * @param student Address of the student
     * @param credentialType Type of credential
     * @param courseName Name of the course/program
     * @param studentName Name of the student
     * @param studentId Student ID
     * @param expiryDate Expiry date (0 for no expiry)
     * @param ipfsHash IPFS hash of the credential document
     * @param grade Grade achieved
     * @param metadataURI Token metadata URI
     */
    function issueCredential(
        address student,
        string memory credentialType,
        string memory courseName,
        string memory studentName,
        string memory studentId,
        uint256 expiryDate,
        string memory ipfsHash,
        string memory grade,
        string memory metadataURI
    ) external onlyVerifiedInstitution returns (uint256) {
        require(student != address(0), "Invalid student address");
        require(bytes(credentialType).length > 0, "Credential type required");
        require(bytes(courseName).length > 0, "Course name required");
        require(bytes(studentName).length > 0, "Student name required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(credentialByHash[ipfsHash] == 0, "Credential already exists");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        credentials[newTokenId] = Credential({
            tokenId: newTokenId,
            institution: msg.sender,
            student: student,
            credentialType: credentialType,
            courseName: courseName,
            studentName: studentName,
            studentId: studentId,
            issueDate: block.timestamp,
            expiryDate: expiryDate,
            ipfsHash: ipfsHash,
            status: CredentialStatus.Active,
            grade: grade
        });

        studentCredentials[student].push(newTokenId);
        institutionCredentials[msg.sender].push(newTokenId);
        credentialByHash[ipfsHash] = newTokenId;
        institutions[msg.sender].credentialsIssued++;

        emit CredentialIssued(newTokenId, msg.sender, student, credentialType, block.timestamp);

        return newTokenId;
    }

    /**
     * @dev Revoke a credential (issuing institution only)
     * @param tokenId Token ID of the credential to revoke
     */
    function revokeCredential(uint256 tokenId) external credentialExists(tokenId) {
        require(credentials[tokenId].institution == msg.sender, "Only issuing institution can revoke");
        require(credentials[tokenId].status == CredentialStatus.Active, "Credential not active");

        credentials[tokenId].status = CredentialStatus.Revoked;

        emit CredentialRevoked(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify a credential and emit verification event
     * @param tokenId Token ID to verify
     */
    function verifyCredential(uint256 tokenId) external credentialExists(tokenId) returns (
        bool isValid,
        Credential memory credential,
        Institution memory institution
    ) {
        credential = credentials[tokenId];
        institution = institutions[credential.institution];

        // Check if credential is valid
        isValid = credential.status == CredentialStatus.Active &&
                  institution.isVerified &&
                  (credential.expiryDate == 0 || credential.expiryDate > block.timestamp);

        emit CredentialVerified(tokenId, msg.sender, block.timestamp);

        return (isValid, credential, institution);
    }

    /**
     * @dev Get credential by IPFS hash
     * @param ipfsHash IPFS hash of the credential
     */
    function getCredentialByHash(string memory ipfsHash) external view returns (
        bool exists,
        Credential memory credential
    ) {
        uint256 tokenId = credentialByHash[ipfsHash];
        if (tokenId == 0) {
            return (false, credential);
        }
        return (true, credentials[tokenId]);
    }

    /**
     * @dev Get all credentials for a student
     * @param student Student address
     */
    function getStudentCredentials(address student) external view returns (uint256[] memory) {
        return studentCredentials[student];
    }

    /**
     * @dev Get all credentials issued by an institution
     * @param institution Institution address
     */
    function getInstitutionCredentials(address institution) external view returns (uint256[] memory) {
        return institutionCredentials[institution];
    }

    /**
     * @dev Get credential details
     * @param tokenId Token ID
     */
    function getCredential(uint256 tokenId) external view credentialExists(tokenId) returns (Credential memory) {
        return credentials[tokenId];
    }

    /**
     * @dev Get institution details
     * @param institutionAddress Institution address
     */
    function getInstitution(address institutionAddress) external view returns (Institution memory) {
        return institutions[institutionAddress];
    }

    /**
     * @dev Check if an address is a verified institution
     * @param institutionAddress Address to check
     */
    function isVerifiedInstitution(address institutionAddress) external view returns (bool) {
        return institutions[institutionAddress].isVerified;
    }

    /**
     * @dev Get total number of credentials issued
     */
    function getTotalCredentials() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
