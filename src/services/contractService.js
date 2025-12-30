/**
 * Smart Contract Service
 * Handles all interactions with the blockchain smart contracts
 */

import { ethers } from 'ethers';
import CredentialNFTABI from '../contracts/CredentialNFT.json';
import InstitutionRegistryABI from '../contracts/InstitutionRegistry.json';

// Contract addresses (will be set after deployment)
const CREDENTIAL_NFT_ADDRESS = process.env.REACT_APP_CREDENTIAL_NFT_ADDRESS;
const INSTITUTION_REGISTRY_ADDRESS = process.env.REACT_APP_INSTITUTION_REGISTRY_ADDRESS;

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.credentialNFT = null;
    this.institutionRegistry = null;
  }

  /**
   * Initialize the service with Web3 provider
   * @param {Object} provider - Web3 provider from MetaMask
   */
  async initialize(provider) {
    try {
      this.provider = new ethers.BrowserProvider(provider);
      this.signer = await this.provider.getSigner();
      
      // Initialize contract instances
      if (CREDENTIAL_NFT_ADDRESS) {
        this.credentialNFT = new ethers.Contract(
          CREDENTIAL_NFT_ADDRESS,
          CredentialNFTABI.abi,
          this.signer
        );
      }

      if (INSTITUTION_REGISTRY_ADDRESS) {
        this.institutionRegistry = new ethers.Contract(
          INSTITUTION_REGISTRY_ADDRESS,
          InstitutionRegistryABI.abi,
          this.signer
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Contract initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== INSTITUTION FUNCTIONS ====================

  /**
   * Register a new institution
   * @param {string} name - Institution name
   * @param {string} registrationId - Official registration ID
   */
  async registerInstitution(name, registrationId) {
    try {
      const tx = await this.credentialNFT.registerInstitution(name, registrationId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Register institution error:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Get institution details
   * @param {string} address - Institution wallet address
   */
  async getInstitution(address) {
    try {
      const institution = await this.credentialNFT.getInstitution(address);
      return {
        success: true,
        data: {
          name: institution.name,
          registrationId: institution.registrationId,
          isVerified: institution.isVerified,
          registrationDate: Number(institution.registrationDate),
          credentialsIssued: Number(institution.credentialsIssued),
        },
      };
    } catch (error) {
      console.error('Get institution error:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Check if an address is a verified institution
   * @param {string} address - Address to check
   */
  async isVerifiedInstitution(address) {
    try {
      const isVerified = await this.credentialNFT.isVerifiedInstitution(address);
      return { success: true, isVerified };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Verify an institution (admin only)
   * @param {string} institutionAddress - Institution to verify
   */
  async verifyInstitution(institutionAddress) {
    try {
      const tx = await this.credentialNFT.verifyInstitution(institutionAddress);
      const receipt = await tx.wait();
      return { success: true, transactionHash: receipt.hash };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  // ==================== CREDENTIAL FUNCTIONS ====================

  /**
   * Issue a new credential
   * @param {Object} credentialData - Credential information
   */
  async issueCredential(credentialData) {
    try {
      const tx = await this.credentialNFT.issueCredential(
        credentialData.studentAddress,
        credentialData.credentialType,
        credentialData.courseName,
        credentialData.studentName,
        credentialData.studentId,
        credentialData.expiryDate || 0,
        credentialData.ipfsHash,
        credentialData.grade,
        credentialData.metadataURI
      );

      const receipt = await tx.wait();
      
      // Get the token ID from the event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'CredentialIssued'
      );
      
      const tokenId = event ? Number(event.args[0]) : null;

      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Issue credential error:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Get credential details by token ID
   * @param {number} tokenId - Token ID
   */
  async getCredential(tokenId) {
    try {
      const credential = await this.credentialNFT.getCredential(tokenId);
      return {
        success: true,
        data: {
          tokenId: Number(credential.tokenId),
          institution: credential.institution,
          student: credential.student,
          credentialType: credential.credentialType,
          courseName: credential.courseName,
          studentName: credential.studentName,
          studentId: credential.studentId,
          issueDate: Number(credential.issueDate),
          expiryDate: Number(credential.expiryDate),
          ipfsHash: credential.ipfsHash,
          status: Number(credential.status), // 0: Active, 1: Revoked, 2: Expired
          grade: credential.grade,
        },
      };
    } catch (error) {
      console.error('Get credential error:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Verify a credential
   * @param {number} tokenId - Token ID to verify
   */
  async verifyCredential(tokenId) {
    try {
      const result = await this.credentialNFT.verifyCredential.staticCall(tokenId);
      
      return {
        success: true,
        data: {
          isValid: result[0],
          credential: {
            tokenId: Number(result[1].tokenId),
            institution: result[1].institution,
            student: result[1].student,
            credentialType: result[1].credentialType,
            courseName: result[1].courseName,
            studentName: result[1].studentName,
            studentId: result[1].studentId,
            issueDate: Number(result[1].issueDate),
            expiryDate: Number(result[1].expiryDate),
            ipfsHash: result[1].ipfsHash,
            status: Number(result[1].status),
            grade: result[1].grade,
          },
          institution: {
            name: result[2].name,
            registrationId: result[2].registrationId,
            isVerified: result[2].isVerified,
            registrationDate: Number(result[2].registrationDate),
            credentialsIssued: Number(result[2].credentialsIssued),
          },
        },
      };
    } catch (error) {
      console.error('Verify credential error:', error);
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Get credential by IPFS hash
   * @param {string} ipfsHash - IPFS hash of the credential
   */
  async getCredentialByHash(ipfsHash) {
    try {
      const [exists, credential] = await this.credentialNFT.getCredentialByHash(ipfsHash);
      
      if (!exists) {
        return { success: false, error: 'Credential not found' };
      }

      return {
        success: true,
        data: {
          tokenId: Number(credential.tokenId),
          institution: credential.institution,
          student: credential.student,
          credentialType: credential.credentialType,
          courseName: credential.courseName,
          studentName: credential.studentName,
          studentId: credential.studentId,
          issueDate: Number(credential.issueDate),
          expiryDate: Number(credential.expiryDate),
          ipfsHash: credential.ipfsHash,
          status: Number(credential.status),
          grade: credential.grade,
        },
      };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Revoke a credential
   * @param {number} tokenId - Token ID to revoke
   */
  async revokeCredential(tokenId) {
    try {
      const tx = await this.credentialNFT.revokeCredential(tokenId);
      const receipt = await tx.wait();
      return { success: true, transactionHash: receipt.hash };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Get all credentials for a student
   * @param {string} studentAddress - Student wallet address
   */
  async getStudentCredentials(studentAddress) {
    try {
      const tokenIds = await this.credentialNFT.getStudentCredentials(studentAddress);
      const credentials = [];

      for (const tokenId of tokenIds) {
        const result = await this.getCredential(Number(tokenId));
        if (result.success) {
          credentials.push(result.data);
        }
      }

      return { success: true, data: credentials };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Get all credentials issued by an institution
   * @param {string} institutionAddress - Institution wallet address
   */
  async getInstitutionCredentials(institutionAddress) {
    try {
      const tokenIds = await this.credentialNFT.getInstitutionCredentials(institutionAddress);
      const credentials = [];

      for (const tokenId of tokenIds) {
        const result = await this.getCredential(Number(tokenId));
        if (result.success) {
          credentials.push(result.data);
        }
      }

      return { success: true, data: credentials };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Get total number of credentials issued
   */
  async getTotalCredentials() {
    try {
      const total = await this.credentialNFT.getTotalCredentials();
      return { success: true, total: Number(total) };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  /**
   * Get the token URI (metadata URL)
   * @param {number} tokenId - Token ID
   */
  async getTokenURI(tokenId) {
    try {
      const uri = await this.credentialNFT.tokenURI(tokenId);
      return { success: true, uri };
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Parse contract errors into readable messages
   * @param {Error} error - The error object
   */
  parseError(error) {
    if (error.reason) {
      return error.reason;
    }
    if (error.message) {
      // Extract revert reason from error message
      const match = error.message.match(/reason="([^"]+)"/);
      if (match) return match[1];
      
      // Check for common errors
      if (error.message.includes('user rejected')) {
        return 'Transaction was rejected by user';
      }
      if (error.message.includes('insufficient funds')) {
        return 'Insufficient funds for transaction';
      }
    }
    return 'An error occurred';
  }

  /**
   * Format timestamp to date string
   * @param {number} timestamp - Unix timestamp
   */
  formatDate(timestamp) {
    if (!timestamp || timestamp === 0) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  }

  /**
   * Get credential status string
   * @param {number} status - Status code
   */
  getStatusString(status) {
    const statuses = ['Active', 'Revoked', 'Expired'];
    return statuses[status] || 'Unknown';
  }

  /**
   * Listen for credential issued events
   * @param {Function} callback - Callback function
   */
  onCredentialIssued(callback) {
    if (this.credentialNFT) {
      this.credentialNFT.on('CredentialIssued', (tokenId, institution, student, credentialType, timestamp) => {
        callback({
          tokenId: Number(tokenId),
          institution,
          student,
          credentialType,
          timestamp: Number(timestamp),
        });
      });
    }
  }

  /**
   * Listen for credential revoked events
   * @param {Function} callback - Callback function
   */
  onCredentialRevoked(callback) {
    if (this.credentialNFT) {
      this.credentialNFT.on('CredentialRevoked', (tokenId, institution, timestamp) => {
        callback({
          tokenId: Number(tokenId),
          institution,
          timestamp: Number(timestamp),
        });
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    if (this.credentialNFT) {
      this.credentialNFT.removeAllListeners();
    }
    if (this.institutionRegistry) {
      this.institutionRegistry.removeAllListeners();
    }
  }
}

// Export singleton instance
const contractService = new ContractService();
export default contractService;
