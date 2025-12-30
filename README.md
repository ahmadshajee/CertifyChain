# 🎓 CertifyChain - Blockchain Credential Verification System

<p align="center">
  <img src="public/logo.png" alt="CertifyChain Logo" width="200"/>
</p>

<p align="center">
  <strong>Secure, Transparent, and Tamper-Proof Academic Credential Verification</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#api-documentation">API</a> •
  <a href="#smart-contracts">Contracts</a>
</p>

---

## 📋 Overview

CertifyChain is a decentralized application (dApp) that revolutionizes academic credential verification using blockchain technology. Educational institutions can issue tamper-proof digital certificates as NFTs, students can securely share their credentials, and employers/verifiers can instantly authenticate certificates without intermediaries.

## ✨ Features

### For Institutions
- 🏛️ **Register & Get Verified** - Institutions undergo verification before issuing credentials
- 📜 **Issue NFT Credentials** - Mint credentials as ERC-721 NFTs on blockchain
- 📊 **Dashboard Analytics** - Track issued credentials and verification stats
- 🔄 **Revocation Support** - Revoke credentials when necessary

### For Students
- 👛 **Wallet Integration** - Connect MetaMask to manage credentials
- 📱 **QR Code Sharing** - Generate QR codes for easy verification
- 🔗 **Shareable Links** - Create verification links for employers
- 📂 **Credential Portfolio** - View all credentials in one place

### For Verifiers
- ✅ **Instant Verification** - Verify credentials in seconds
- 🔍 **Multiple Methods** - Verify by ID, QR code, or IPFS hash
- 📋 **Detailed Reports** - View complete credential details
- 🔐 **Trustless Verification** - No need to contact institutions

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router v6, Web3.js, Ethers.js |
| **Smart Contracts** | Solidity 0.8.20, OpenZeppelin v5, Hardhat |
| **Backend** | Node.js, Express.js, MongoDB, JWT |
| **Storage** | IPFS (Pinata), MongoDB |
| **Blockchain** | Ethereum (Sepolia Testnet / Mainnet) |

## 📁 Project Structure

```
certifychain/
├── contracts/                 # Solidity smart contracts
│   ├── CredentialNFT.sol     # ERC-721 credential NFT
│   └── InstitutionRegistry.sol # Institution management
├── scripts/                   # Deployment scripts
├── test/                      # Contract tests (52 tests)
├── backend/                   # Express.js API server
│   ├── src/
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation
│   │   └── utils/            # Helpers
│   └── package.json
├── src/                       # React frontend
│   ├── components/           # Reusable components
│   ├── context/              # React context providers
│   ├── pages/                # Page components
│   ├── services/             # API & contract services
│   └── styles/               # CSS styles
├── public/                    # Static assets
└── hardhat.config.js         # Hardhat configuration
```

## 🚀 Installation

### Prerequisites
- Node.js v18+ 
- MongoDB (local or Atlas)
- MetaMask browser extension
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/ahmadshajee/CertifyChain.git
cd CertifyChain
```

### 2. Install Dependencies

```bash
# Install frontend & smart contract dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 3. Configure Environment

```bash
# Copy environment template
copy .env.example .env

# Edit .env with your values:
# - Pinata API keys (https://app.pinata.cloud)
# - MongoDB connection string
# - JWT secret
```

### 4. Start Local Blockchain

```bash
# Terminal 1: Start Hardhat node
npx hardhat node
```

### 5. Deploy Smart Contracts

```bash
# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### 6. Start Backend Server

```bash
# Terminal 3: Start Express server
cd backend && npm start
```

### 7. Start Frontend

```bash
# Terminal 4: Start React app
npm start
```

### 8. Configure MetaMask

1. Open MetaMask
2. Add Network:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency:** ETH

3. Import test account (10,000 ETH):
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## 💻 Usage

### Access Points
| Portal | URL | Description |
|--------|-----|-------------|
| Landing Page | http://localhost:3000 | Main website |
| Institution Portal | http://localhost:3000/institution | Issue & manage credentials |
| Student Portal | http://localhost:3000/student | View & share credentials |
| Verifier Portal | http://localhost:3000/verify | Verify credentials |
| Backend API | http://localhost:5000/api | REST API |

### Workflow

1. **Institution Registration**
   - Register institution with details
   - Submit verification documents
   - Wait for admin approval

2. **Credential Issuance**
   - Fill credential form (student name, degree, etc.)
   - Upload supporting documents to IPFS
   - Mint NFT on blockchain
   - Student receives credential

3. **Credential Verification**
   - Verifier enters credential ID or scans QR
   - System queries blockchain
   - Returns verification status with details

## 📚 API Documentation

### Authentication
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login with email/password
GET  /api/auth/nonce/:addr # Get nonce for wallet auth
POST /api/auth/wallet      # Verify wallet signature
GET  /api/auth/me          # Get current user
```

### Institutions
```
POST /api/institutions              # Register institution
GET  /api/institutions              # List institutions
GET  /api/institutions/:id          # Get institution details
PUT  /api/institutions/:id          # Update institution
POST /api/institutions/:id/verify   # Request verification
POST /api/institutions/:id/approve  # Approve (admin)
POST /api/institutions/:id/reject   # Reject (admin)
```

### Credentials
```
POST /api/credentials                    # Issue credential
GET  /api/credentials                    # List credentials
GET  /api/credentials/:id                # Get credential
GET  /api/credentials/student/:address   # Student's credentials
GET  /api/credentials/institution/:id    # Institution's credentials
POST /api/credentials/:id/revoke         # Revoke credential
```

### Verification
```
GET  /api/verification/verify/:id   # Verify by ID
GET  /api/verification/hash/:hash   # Verify by IPFS hash
POST /api/verification/batch        # Batch verify
GET  /api/verification/stats        # Get statistics
```

## 📜 Smart Contracts

### CredentialNFT.sol
ERC-721 NFT contract for credential management.

**Key Functions:**
```solidity
registerInstitution(name)           // Register as institution
verifyInstitution(address)          // Admin verifies institution
issueCredential(student, ipfsHash)  // Issue credential NFT
revokeCredential(tokenId, reason)   // Revoke credential
verifyCredential(tokenId)           // Verify credential status
```

### InstitutionRegistry.sol
Standalone registry for institution management.

**Key Functions:**
```solidity
registerInstitution(...)            // Register with full details
requestVerification(documentsHash)  // Submit for verification
approveVerification(institutionId)  // Admin approves
rejectVerification(id, reason)      // Admin rejects
getVerifiedInstitutions()           // Get all verified
```

## 🧪 Testing

```bash
# Run all 52 smart contract tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/CredentialNFT.test.js
```

## 🌐 Deployment

### Sepolia Testnet

1. Get free Sepolia ETH from faucet:
   - https://sepoliafaucet.com
   - https://faucets.chain.link

2. Configure `.env`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

4. Verify on Etherscan:
```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

## 🔒 Security

- Smart contracts use OpenZeppelin's audited libraries
- Role-based access control (RBAC)
- JWT authentication with secure secrets
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ahmad Shajee**
- GitHub: [@ahmadshajee](https://github.com/ahmadshajee)

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat team for excellent development tools
- Pinata for IPFS hosting
- The Ethereum community

---

<p align="center">
  Built with ❤️ for the future of education
</p>
