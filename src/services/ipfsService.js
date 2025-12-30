/**
 * IPFS Service using Pinata
 * Handles uploading and retrieving credential documents from IPFS
 */

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;
const PINATA_GATEWAY = process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

class IPFSService {
  constructor() {
    this.baseUrl = 'https://api.pinata.cloud';
  }

  /**
   * Get authorization headers for Pinata API
   */
  getHeaders() {
    return {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY,
    };
  }

  /**
   * Upload a file to IPFS via Pinata
   * @param {File} file - The file to upload
   * @param {Object} metadata - Optional metadata for the file
   * @returns {Promise<{success: boolean, ipfsHash: string, pinataUrl: string}>}
   */
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const pinataMetadata = JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: {
          type: metadata.type || 'credential',
          studentId: metadata.studentId || '',
          institution: metadata.institution || '',
          timestamp: new Date().toISOString(),
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload to IPFS');
      }

      const result = await response.json();
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        pinataUrl: `${PINATA_GATEWAY}/${result.IpfsHash}`,
        size: result.PinSize,
        timestamp: result.Timestamp,
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   * @param {Object} jsonData - The JSON data to upload
   * @param {string} name - Name for the pin
   * @returns {Promise<{success: boolean, ipfsHash: string, pinataUrl: string}>}
   */
  async uploadJSON(jsonData, name = 'credential-metadata') {
    try {
      const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataContent: jsonData,
          pinataMetadata: {
            name: name,
          },
          pinataOptions: {
            cidVersion: 1,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload JSON to IPFS');
      }

      const result = await response.json();
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        pinataUrl: `${PINATA_GATEWAY}/${result.IpfsHash}`,
      };
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create and upload credential metadata for NFT
   * @param {Object} credentialData - Credential information
   * @returns {Promise<{success: boolean, metadataHash: string, metadataUrl: string}>}
   */
  async uploadCredentialMetadata(credentialData) {
    const metadata = {
      name: `${credentialData.credentialType} - ${credentialData.courseName}`,
      description: `Academic credential issued by ${credentialData.institutionName} to ${credentialData.studentName}`,
      image: credentialData.imageUrl || '',
      external_url: credentialData.verificationUrl || '',
      attributes: [
        { trait_type: 'Credential Type', value: credentialData.credentialType },
        { trait_type: 'Course Name', value: credentialData.courseName },
        { trait_type: 'Student Name', value: credentialData.studentName },
        { trait_type: 'Student ID', value: credentialData.studentId },
        { trait_type: 'Institution', value: credentialData.institutionName },
        { trait_type: 'Grade', value: credentialData.grade },
        { trait_type: 'Issue Date', value: credentialData.issueDate },
        { trait_type: 'Expiry Date', value: credentialData.expiryDate || 'No Expiry' },
      ],
      properties: {
        category: 'academic_credential',
        creators: [
          {
            address: credentialData.institutionAddress,
            share: 100,
          },
        ],
      },
    };

    return this.uploadJSON(metadata, `credential-${credentialData.studentId}-${Date.now()}`);
  }

  /**
   * Upload credential document (PDF, image, etc.)
   * @param {File} file - The document file
   * @param {Object} credentialInfo - Information about the credential
   * @returns {Promise<Object>}
   */
  async uploadCredentialDocument(file, credentialInfo) {
    return this.uploadFile(file, {
      name: `${credentialInfo.studentId}-${credentialInfo.credentialType}-document`,
      type: 'credential-document',
      studentId: credentialInfo.studentId,
      institution: credentialInfo.institutionAddress,
    });
  }

  /**
   * Get content from IPFS by hash
   * @param {string} ipfsHash - The IPFS hash
   * @returns {Promise<Object>}
   */
  async getFromIPFS(ipfsHash) {
    try {
      const response = await fetch(`${PINATA_GATEWAY}/${ipfsHash}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch from IPFS');
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        return {
          success: true,
          data: await response.json(),
          type: 'json',
        };
      } else {
        return {
          success: true,
          data: await response.blob(),
          type: 'file',
          url: `${PINATA_GATEWAY}/${ipfsHash}`,
        };
      }
    } catch (error) {
      console.error('IPFS fetch error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get the public gateway URL for an IPFS hash
   * @param {string} ipfsHash - The IPFS hash
   * @returns {string}
   */
  getGatewayUrl(ipfsHash) {
    if (!ipfsHash) return '';
    // Handle both raw hash and ipfs:// protocol
    const hash = ipfsHash.replace('ipfs://', '');
    return `${PINATA_GATEWAY}/${hash}`;
  }

  /**
   * Unpin content from Pinata (delete)
   * @param {string} ipfsHash - The IPFS hash to unpin
   * @returns {Promise<{success: boolean}>}
   */
  async unpin(ipfsHash) {
    try {
      const response = await fetch(`${this.baseUrl}/pinning/unpin/${ipfsHash}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to unpin from IPFS');
      }

      return { success: true };
    } catch (error) {
      console.error('IPFS unpin error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test Pinata connection
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/data/testAuthentication`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      return {
        success: true,
        message: 'Connected to Pinata successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

// Export singleton instance
const ipfsService = new IPFSService();
export default ipfsService;
