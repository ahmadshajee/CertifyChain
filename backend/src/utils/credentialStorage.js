/**
 * Credentials JSON Storage Service
 * Handles reading/writing credential data to JSON file
 */

const fs = require('fs');
const path = require('path');

const CREDENTIALS_FILE = path.join(__dirname, '../../data/credentials.json');

// Ensure data directory exists
const dataDir = path.dirname(CREDENTIALS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(CREDENTIALS_FILE)) {
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify({ credentials: [], nextTokenId: 1 }, null, 2));
}

/**
 * Read credentials from JSON file
 */
const readCredentials = () => {
  try {
    const data = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading credentials file:', error);
    return { credentials: [], nextTokenId: 1 };
  }
};

/**
 * Write credentials to JSON file
 */
const writeCredentials = (data) => {
  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing credentials file:', error);
    return false;
  }
};

/**
 * Generate unique ID
 */
const generateId = () => {
  return 'cred_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Create a new credential
 */
const createCredential = (credentialData) => {
  const data = readCredentials();
  
  const newCredential = {
    id: generateId(),
    tokenId: data.nextTokenId,
    institutionId: credentialData.institutionId,
    institutionName: credentialData.institutionName,
    institutionEmail: credentialData.institutionEmail,
    studentId: credentialData.studentId || null,
    studentName: credentialData.studentName,
    studentEmail: credentialData.studentEmail,
    credentialType: credentialData.credentialType,
    courseName: credentialData.courseName,
    grade: credentialData.grade || '',
    issueDate: credentialData.issueDate || new Date().toISOString().split('T')[0],
    expiryDate: credentialData.expiryDate || null,
    status: 'active',
    ipfsHash: credentialData.ipfsHash || 'Qm' + Math.random().toString(36).substr(2, 44),
    description: credentialData.description || '',
    createdAt: new Date().toISOString()
  };
  
  data.credentials.push(newCredential);
  data.nextTokenId += 1;
  writeCredentials(data);
  
  return newCredential;
};

/**
 * Get all credentials
 */
const getAllCredentials = () => {
  const data = readCredentials();
  return data.credentials;
};

/**
 * Get credential by ID
 */
const getCredentialById = (id) => {
  const data = readCredentials();
  return data.credentials.find(c => c.id === id || c.tokenId === parseInt(id));
};

/**
 * Get credentials by institution
 */
const getCredentialsByInstitution = (institutionEmail) => {
  const data = readCredentials();
  return data.credentials.filter(c => c.institutionEmail === institutionEmail);
};

/**
 * Get credentials by student
 */
const getCredentialsByStudent = (studentEmail) => {
  const data = readCredentials();
  return data.credentials.filter(c => c.studentEmail === studentEmail);
};

/**
 * Update credential status (revoke)
 */
const revokeCredential = (id) => {
  const data = readCredentials();
  const credIndex = data.credentials.findIndex(c => c.id === id || c.tokenId === parseInt(id));
  
  if (credIndex === -1) {
    throw new Error('Credential not found');
  }
  
  data.credentials[credIndex].status = 'revoked';
  data.credentials[credIndex].revokedAt = new Date().toISOString();
  writeCredentials(data);
  
  return data.credentials[credIndex];
};

/**
 * Verify credential
 */
const verifyCredential = (id) => {
  const data = readCredentials();
  const credential = data.credentials.find(c => c.id === id || c.tokenId === parseInt(id));
  
  if (!credential) {
    return { isValid: false, message: 'Credential not found' };
  }
  
  if (credential.status === 'revoked') {
    return { isValid: false, message: 'Credential has been revoked', credential };
  }
  
  if (credential.expiryDate && new Date(credential.expiryDate) < new Date()) {
    return { isValid: false, message: 'Credential has expired', credential };
  }
  
  return { isValid: true, message: 'Credential is valid', credential };
};

/**
 * Delete credential (admin only)
 */
const deleteCredential = (id) => {
  const data = readCredentials();
  const initialLength = data.credentials.length;
  data.credentials = data.credentials.filter(c => c.id !== id && c.tokenId !== parseInt(id));
  
  if (data.credentials.length === initialLength) {
    throw new Error('Credential not found');
  }
  
  writeCredentials(data);
  return true;
};

/**
 * Get credential statistics
 */
const getStats = (institutionEmail = null) => {
  const data = readCredentials();
  let credentials = data.credentials;
  
  if (institutionEmail) {
    credentials = credentials.filter(c => c.institutionEmail === institutionEmail);
  }
  
  return {
    total: credentials.length,
    active: credentials.filter(c => c.status === 'active').length,
    revoked: credentials.filter(c => c.status === 'revoked').length,
    expired: credentials.filter(c => c.expiryDate && new Date(c.expiryDate) < new Date()).length,
    byType: credentials.reduce((acc, c) => {
      acc[c.credentialType] = (acc[c.credentialType] || 0) + 1;
      return acc;
    }, {})
  };
};

module.exports = {
  readCredentials,
  writeCredentials,
  createCredential,
  getAllCredentials,
  getCredentialById,
  getCredentialsByInstitution,
  getCredentialsByStudent,
  revokeCredential,
  verifyCredential,
  deleteCredential,
  getStats
};
