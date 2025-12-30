// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000, // 30 seconds
};

// IPFS Configuration
export const IPFS_CONFIG = {
  PINATA_API_KEY: process.env.REACT_APP_PINATA_API_KEY || '',
  PINATA_SECRET_KEY: process.env.REACT_APP_PINATA_SECRET_KEY || '',
  GATEWAY: process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'AccredChain',
  APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@AccredChain.io',
};

export default { API_CONFIG, IPFS_CONFIG, APP_CONFIG };
