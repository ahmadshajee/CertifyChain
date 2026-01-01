/**
 * JSON File Storage Service
 * Handles reading/writing user data to JSON file
 * Alternative to MongoDB for simple deployments
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], sessions: [] }, null, 2));
}

/**
 * Read data from JSON file
 */
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { users: [], sessions: [] };
  }
};

/**
 * Write data to JSON file
 */
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

/**
 * Generate unique ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ==================== USER OPERATIONS ====================

/**
 * Register a new user
 */
const registerUser = async (userData) => {
  const data = readData();
  
  // Check if email already exists
  const existingEmail = data.users.find(u => u.email === userData.email);
  if (existingEmail) {
    throw new Error('Email already registered');
  }
  
  // Check if wallet already exists
  if (userData.walletAddress) {
    const existingWallet = data.users.find(u => u.walletAddress === userData.walletAddress);
    if (existingWallet) {
      throw new Error('Wallet address already registered');
    }
  }
  
  // Store plain text password (for development/research only)
  const plainPassword = userData.password;
  
  // Create new user
  const newUser = {
    id: generateId(),
    email: userData.email,
    password: plainPassword,  // Plain text password
    name: userData.name,
    walletAddress: userData.walletAddress || null,
    role: userData.role || 'student',
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    nonce: null
  };
  
  data.users.push(newUser);
  writeData(data);
  
  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  const token = generateToken(newUser.id);
  
  return { user: userWithoutPassword, token };
};

/**
 * Login user with email/password
 */
const loginUser = async (email, password) => {
  const data = readData();
  
  // Find user by email (case-insensitive)
  const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.log('User not found for email:', email);
    console.log('Available emails:', data.users.map(u => u.email));
    throw new Error('Invalid email or password');
  }
  
  // Check password (plain text comparison)
  if (user.password !== password) {
    console.log('Password mismatch for user:', email);
    throw new Error('Invalid email or password');
  }
  
  // Update last login
  user.lastLogin = new Date().toISOString();
  writeData(data);
  
  // Create session
  const token = generateToken(user.id);
  const session = {
    id: generateId(),
    userId: user.id,
    token: token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  data.sessions.push(session);
  writeData(data);
  
  // Return user without password
  const { password: pwd, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

/**
 * Get nonce for wallet authentication
 */
const getNonce = (walletAddress) => {
  const data = readData();
  
  // Find or create user by wallet
  let user = data.users.find(u => u.walletAddress === walletAddress);
  
  // Generate new nonce
  const nonce = Math.floor(Math.random() * 1000000).toString();
  
  if (user) {
    user.nonce = nonce;
  } else {
    // Create temporary user entry for nonce
    user = {
      id: generateId(),
      walletAddress: walletAddress,
      nonce: nonce,
      role: 'student',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    data.users.push(user);
  }
  
  writeData(data);
  return { nonce };
};

/**
 * Verify wallet signature and login
 */
const verifyWalletLogin = (walletAddress, nonce) => {
  const data = readData();
  
  // Find user by wallet
  const user = data.users.find(u => u.walletAddress === walletAddress);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify nonce
  if (user.nonce !== nonce) {
    throw new Error('Invalid nonce');
  }
  
  // Clear nonce and update login time
  user.nonce = null;
  user.lastLogin = new Date().toISOString();
  
  // Create session
  const token = generateToken(user.id);
  const session = {
    id: generateId(),
    userId: user.id,
    token: token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  data.sessions.push(session);
  writeData(data);
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

/**
 * Get user by ID
 */
const getUserById = (userId) => {
  const data = readData();
  const user = data.users.find(u => u.id === userId);
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get user by token
 */
const getUserByToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return getUserById(decoded.id);
  } catch (error) {
    return null;
  }
};

/**
 * Logout user (invalidate session)
 */
const logoutUser = (token) => {
  const data = readData();
  data.sessions = data.sessions.filter(s => s.token !== token);
  writeData(data);
  return true;
};

/**
 * Get all users (admin)
 */
const getAllUsers = () => {
  const data = readData();
  return data.users.map(({ password, ...user }) => user);
};

/**
 * Update user
 */
const updateUser = (userId, updates) => {
  const data = readData();
  const userIndex = data.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Don't allow updating certain fields
  delete updates.id;
  delete updates.password;
  delete updates.createdAt;
  
  data.users[userIndex] = { ...data.users[userIndex], ...updates };
  writeData(data);
  
  const { password, ...userWithoutPassword } = data.users[userIndex];
  return userWithoutPassword;
};

/**
 * Delete user
 */
const deleteUser = (userId) => {
  const data = readData();
  data.users = data.users.filter(u => u.id !== userId);
  data.sessions = data.sessions.filter(s => s.userId !== userId);
  writeData(data);
  return true;
};

module.exports = {
  readData,
  writeData,
  registerUser,
  loginUser,
  getNonce,
  verifyWalletLogin,
  getUserById,
  getUserByToken,
  logoutUser,
  getAllUsers,
  updateUser,
  deleteUser
};
