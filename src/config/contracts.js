// Auto-generated contract configuration
// Run 'npx hardhat run scripts/deploy.js --network localhost' to update addresses

export const CONTRACTS = {
  // Contract addresses - update after deployment
  CREDENTIAL_NFT: process.env.REACT_APP_CREDENTIAL_NFT_ADDRESS || '',
  INSTITUTION_REGISTRY: process.env.REACT_APP_INSTITUTION_REGISTRY_ADDRESS || '',
  
  // Network configuration
  NETWORK: process.env.REACT_APP_NETWORK_NAME || 'Hardhat Local',
  CHAIN_ID: parseInt(process.env.REACT_APP_CHAIN_ID) || 31337,
  
  // RPC URL for read-only operations
  RPC_URL: 'http://127.0.0.1:8545'
};

// Hardhat local network accounts (for testing only - NEVER use in production)
export const TEST_ACCOUNTS = {
  deployer: {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  },
  institution: {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  },
  student: {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
  }
};

export default CONTRACTS;
