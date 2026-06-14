import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { User, Trader, Deposit, Withdrawal, Transaction, Notification, Stats } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Define DB Interface
interface DatabaseSchema {
  users: User[];
  passwords: { [userId: string]: string }; // Map of userId to plain password
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  transactions: Transaction[];
  notifications: Notification[];
  traders: Trader[];
  dailyProfitHistory: { id: string; percentage: number; createdAt: string }[];
}

const DEFAULT_TRADERS: Trader[] = [
  {
    id: "alpha_algo",
    name: "Alpha Algo",
    winRate: 94.2,
    profitShare: 10,
    copiersCount: 1240,
    totalProfit: 450200,
    avatar: "🤖",
    riskLevel: "Low",
    description: "Multi-strategy quantitative trading algorithm centering BTC & ETH spot/futures arbitrage."
  },
  {
    id: "apex_vip",
    name: "Apex VIP",
    winRate: 97.5,
    profitShare: 15,
    copiersCount: 854,
    totalProfit: 789100,
    avatar: "👑",
    riskLevel: "Medium",
    description: "High-conviction trend continuation setups in large-cap altcoins with strict risk caps."
  },
  {
    id: "golden_ether",
    name: "Golden Ether",
    winRate: 88.7,
    profitShare: 8,
    copiersCount: 2130,
    totalProfit: 289400,
    avatar: "✨",
    riskLevel: "Low",
    description: "Volume-profile and orderflow-validated swing trading of Ethereum ecosystem tokens."
  },
  {
    id: "bull_charge",
    name: "Bull Charge",
    winRate: 91.1,
    profitShare: 12,
    copiersCount: 412,
    totalProfit: 156000,
    avatar: "⚡",
    riskLevel: "High",
    description: "Momentum breakout scanning and high-leverage scalping on extreme sentiment coins."
  }
];

// Helper to load database
function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const freshDb: DatabaseSchema = {
      users: [],
      passwords: {},
      deposits: [],
      withdrawals: [],
      transactions: [],
      notifications: [],
      traders: DEFAULT_TRADERS,
      dailyProfitHistory: []
    };

    // Pre-seed an Admin account
    const adminId = "admin-uid-100";
    const adminUser: User = {
      id: adminId,
      username: "admin",
      fullName: "System Admin",
      email: "admin@tradeprofithub.com",
      balance: 100000,
      profit: 0,
      copyBalance: 0,
      isCopying: false,
      copyTraderId: null,
      referralCode: "ADMIN100",
      referredBy: null,
      kycStatus: "approved",
      kycData: {
        cnicFront: "System",
        cnicBack: "System",
        selfie: "System",
        submittedAt: new Date().toISOString()
      },
      isAdmin: true,
      createdAt: new Date().toISOString()
    };

    // Pre-seed a Trader client user
    const traderId = "user-uid-john777";
    const normalUser: User = {
      id: traderId,
      username: "trader777",
      fullName: "John Doe",
      email: "john.doe@example.com",
      balance: 2450.50,
      profit: 145.20,
      copyBalance: 1200.00,
      isCopying: true,
      copyTraderId: "apex_vip",
      referralCode: "JOHN777",
      referredBy: "ADMIN100",
      kycStatus: "approved",
      kycData: {
        cnicFront: "Verified_ID",
        cnicBack: "Verified_ID",
        selfie: "Verified_Selfie",
        submittedAt: new Date().toISOString()
      },
      isAdmin: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    };

    freshDb.users.push(adminUser, normalUser);
    freshDb.passwords[adminId] = "admin123";
    freshDb.passwords[traderId] = "password123";

    // Seed some transactions for John Doe
    const preSeedTransactions: Transaction[] = [
      {
        id: "tx-1",
        userId: traderId,
        username: "trader777",
        type: "deposit",
        amount: 3000,
        description: "USDT TRC20 Deposit Approved",
        status: "completed",
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "tx-2",
        userId: traderId,
        username: "trader777",
        type: "copy_trade_start",
        amount: 1200,
        description: "Started Copy Trading: Apex VIP",
        status: "completed",
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "tx-3",
        userId: traderId,
        username: "trader777",
        type: "withdrawal",
        amount: 549.50,
        description: "TRC20 Withdrawal Completed",
        status: "completed",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "tx-4",
        userId: traderId,
        username: "trader777",
        type: "copy_trade_profit",
        amount: 145.20,
        description: "Apex VIP Copy Trade Return (Daily distribution)",
        status: "completed",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    freshDb.transactions = preSeedTransactions;

    // Seed notifications
    freshDb.notifications = [
      {
        id: "notif-1",
        userId: traderId,
        title: "KYC Verified Successfully",
        message: "Your profile has been fully verified. You can now request withdrawals.",
        isRead: false,
        createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "notif-2",
        userId: traderId,
        title: "Deposit Processed",
        message: "Your deposit of 3000 USDT has been approved and credited to your wallet.",
        isRead: true,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    fs.writeFileSync(DB_FILE, JSON.stringify(freshDb, null, 2), "utf-8");
    return freshDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    // Handle structural safety/migrations
    if (!parsed.users) parsed.users = [];
    if (!parsed.passwords) parsed.passwords = {};
    if (!parsed.deposits) parsed.deposits = [];
    if (!parsed.withdrawals) parsed.withdrawals = [];
    if (!parsed.transactions) parsed.transactions = [];
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.traders || parsed.traders.length === 0) parsed.traders = DEFAULT_TRADERS;
    if (!parsed.dailyProfitHistory) parsed.dailyProfitHistory = [];
    return parsed;
  } catch (e) {
    console.error("Failed to parse db.json, returning backup default.", e);
    return {
      users: [],
      passwords: {},
      deposits: [],
      withdrawals: [],
      transactions: [],
      notifications: [],
      traders: DEFAULT_TRADERS,
      dailyProfitHistory: []
    };
  }
}

// Helper to save database
function saveDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Could not write to db.json", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits for base64 uploads (necessary for KYC and proof of payments)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API - Auth Register
  app.post("/api/auth/register", (req, res) => {
    const { username, fullName, email, password, referredBy } = req.body;

    if (!username || !fullName || !password) {
      return res.status(400).json({ error: "Missing mandatory registration fields." });
    }

    const db = loadDb();
    const existingUser = db.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email?.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({ error: "Username or Email is already registered." });
    }

    // Assign referral code
    const referralCode = username.toUpperCase() + Math.floor(100 + Math.random() * 900);
    const userId = "user-" + Math.random().toString(36).substr(2, 9);

    // Verify referrer
    let referrerId: string | null = null;
    if (referredBy) {
      const activeReferrer = db.users.find(
        (u) => u.referralCode.toLowerCase() === referredBy.trim().toLowerCase()
      );
      if (activeReferrer) {
        referrerId = activeReferrer.id;
        // Notify referer immediately!
        db.notifications.push({
          id: "notif-ref-" + Math.random().toString(36).substr(2, 5),
          userId: activeReferrer.id,
          title: "New Affiliate Signup",
          message: `${fullName} has registered using your referral code (${activeReferrer.referralCode}).`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    const newUser: User = {
      id: userId,
      username: username.trim(),
      fullName: fullName.trim(),
      email: (email || `${username}@tradeprofithub.com`).trim(),
      balance: 0,
      profit: 0,
      copyBalance: 0,
      isCopying: false,
      copyTraderId: null,
      referralCode,
      referredBy: referrerId,
      kycStatus: "none",
      kycData: null,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.passwords[userId] = password;
    saveDb(db);

    return res.json({ success: true, user: newUser });
  });

  // API - Auth Login
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required." });
    }

    const db = loadDb();
    const user = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const correctPassword = db.passwords[user.id];
    if (correctPassword !== password) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    return res.json({ success: true, user });
  });

  // API - Get User context
  app.get("/api/users/:userId", (req, res) => {
    const db = loadDb();
    const user = db.users.find((u) => u.id === req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json(user);
  });

  // API - Update Password
  app.post("/api/users/:userId/password", (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.params;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "State parameters missing." });
    }

    const db = loadDb();
    const correctPassword = db.passwords[userId];
    if (correctPassword !== currentPassword) {
      return res.status(400).json({ error: "Current password input is incorrect." });
    }

    db.passwords[userId] = newPassword;
    saveDb(db);
    return res.json({ success: true });
  });

  // API - Submit KYC Documents
  app.post("/api/kyc/submit", (req, res) => {
    const { userId, cnicFront, cnicBack, selfie } = req.body;

    if (!userId || !cnicFront || !cnicBack || !selfie) {
      return res.status(400).json({ error: "All KYC components (CNIC Front, Back, and Selfie photo) are required." });
    }

    const db = loadDb();
    const userIndex = db.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User record not found." });
    }

    db.users[userIndex].kycStatus = "pending";
    db.users[userIndex].kycData = {
      cnicFront,
      cnicBack,
      selfie,
      submittedAt: new Date().toISOString()
    };

    // Create system notification
    db.notifications.push({
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "KYC Documents Received",
      message: "Your identity files are under review by the KYC compliance team.",
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return res.json({ success: true, user: db.users[userIndex] });
  });

  // API - Deposit Request
  app.post("/api/deposit/request", (req, res) => {
    const { userId, amount, txid, screenshot } = req.body;

    if (!userId || !amount || !txid) {
      return res.status(400).json({ error: "Amount and Transaction ID (TXID) are compulsory." });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ error: "Deposit amount must be a positive number." });
    }

    const db = loadDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check duplicate TXID
    const duplicateTx = db.deposits.find((d) => d.txid === txid);
    if (duplicateTx) {
      return res.status(400).json({ error: "This Transaction ID (TXID) has already been submitted." });
    }

    const depositId = "dep-" + Math.random().toString(36).substr(2, 9);
    const newDeposit: Deposit = {
      id: depositId,
      userId,
      username: user.username,
      amount: transferAmount,
      txid,
      status: "pending",
      screenshot,
      createdAt: new Date().toISOString()
    };

    db.deposits.push(newDeposit);

    // Record a pending transaction log
    db.transactions.push({
      id: "tx-dep-" + depositId,
      userId,
      username: user.username,
      type: "deposit",
      amount: transferAmount,
      description: `USDT TRC20 Deposit ($${transferAmount}) - Pending Verification`,
      status: "pending",
      createdAt: new Date().toISOString()
    });

    db.notifications.push({
      id: "notif-dep-" + depositId,
      userId,
      title: "Deposit Filed Successfully",
      message: `Your deposit request for ${transferAmount} USDT (TXID: ${txid.substring(0, 10)}...) was submitted successfully. Waiting for admin audit.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return res.json({ success: true, deposit: newDeposit });
  });

  // API - Withdrawal Request
  app.post("/api/withdrawal/request", (req, res) => {
    const { userId, amount, address } = req.body;

    if (!userId || !amount || !address) {
      return res.status(400).json({ error: "Amount and USDT TRC20 destination address are mandatory." });
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ error: "Withdrawal amount must be a valid number." });
    }

    const db = loadDb();
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = db.users[userIndex];

    // Check KYC status
    if (user.kycStatus !== "approved") {
      return res.status(403).json({ error: "KYC profile must be approved prior to requesting withdrawals." });
    }

    // Check Balance
    if (user.balance < withdrawAmount) {
      return res.status(400).json({ error: `Insufficient fund balance. Your available balance is ${user.balance} USDT.` });
    }

    // Deduct immediate balance to hold it pending approval
    db.users[userIndex].balance -= withdrawAmount;

    const withdrawalId = "with-" + Math.random().toString(36).substr(2, 9);
    const newWithdrawal: Withdrawal = {
      id: withdrawalId,
      userId,
      username: user.username,
      amount: withdrawAmount,
      address,
      network: "TRC20",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    db.withdrawals.push(newWithdrawal);

    // Record transaction
    db.transactions.push({
      id: "tx-with-" + withdrawalId,
      userId,
      username: user.username,
      type: "withdrawal",
      amount: withdrawAmount,
      description: `TRC20 Withdrawal Request ($${withdrawAmount}) to address ${address.substring(0,6)}... - Pending approval`,
      status: "pending",
      createdAt: new Date().toISOString()
    });

    db.notifications.push({
      id: "notif-with-" + withdrawalId,
      userId,
      title: "Withdrawal Requested",
      message: `An amount of ${withdrawAmount} USDT is placed on hold for withdrawal auditing.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return res.json({ success: true, withdrawal: newWithdrawal, user: db.users[userIndex] });
  });

  // API - Start/Join Copy Trading
  app.post("/api/copytrade/join", (req, res) => {
    const { userId, traderId, amount } = req.body;

    if (!userId || !traderId || !amount) {
      return res.status(400).json({ error: "Selection parameters and allocation amount are required." });
    }

    const copyAmount = parseFloat(amount);
    if (isNaN(copyAmount) || copyAmount < 50) {
      return res.status(400).json({ error: "Minimum copy trading allocation amount is 50 USDT." });
    }

    const db = loadDb();
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = db.users[userIndex];
    if (user.isCopying) {
      return res.status(400).json({ error: "An active copy trading allocation is already registered on your account. Terminate current trade first." });
    }

    if (user.balance < copyAmount) {
      return res.status(400).json({ error: `Insufficient balance. Available deposit balance: ${user.balance} USDT.` });
    }

    const trader = db.traders.find((t) => t.id === traderId);
    if (!trader) {
      return res.status(404).json({ error: "Selected trader strategy not active." });
    }

    // Allocate copy funds
    db.users[userIndex].balance -= copyAmount;
    db.users[userIndex].copyBalance = copyAmount;
    db.users[userIndex].isCopying = true;
    db.users[userIndex].copyTraderId = traderId;

    // Increment trader copiers count
    const traderIndex = db.traders.findIndex((t) => t.id === traderId);
    if (traderIndex !== -1) {
      db.traders[traderIndex].copiersCount += 1;
    }

    // Record transactions
    db.transactions.push({
      id: "tx-ct-start-" + Math.random().toString(36).substr(2, 5),
      userId,
      username: user.username,
      type: "copy_trade_start",
      amount: copyAmount,
      description: `Copied strategy ${trader.name} with ${copyAmount} USDT`,
      status: "completed",
      createdAt: new Date().toISOString()
    });

    db.notifications.push({
      id: "notif-ct-start-" + Math.random().toString(36).substr(2, 5),
      userId,
      title: "Copy Trading Activated",
      message: `You are now copying ${trader.name} with ${copyAmount} USDT. Daily outputs will accrue automatically.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return res.json({ success: true, user: db.users[userIndex] });
  });

  // API - Stop Copy Trading
  app.post("/api/copytrade/stop", (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID required." });
    }

    const db = loadDb();
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = db.users[userIndex];
    if (!user.isCopying) {
      return res.status(400).json({ error: "No active copy trade session to stop." });
    }

    const activeTraderId = user.copyTraderId;
    const releaseAmount = user.copyBalance;

    // Release funds
    db.users[userIndex].balance += releaseAmount;
    db.users[userIndex].copyBalance = 0;
    db.users[userIndex].isCopying = false;
    db.users[userIndex].copyTraderId = null;

    // Decrement trader copiers count
    if (activeTraderId) {
      const traderIndex = db.traders.findIndex((t) => t.id === activeTraderId);
      if (traderIndex !== -1 && db.traders[traderIndex].copiersCount > 0) {
        db.traders[traderIndex].copiersCount -= 1;
      }
    }

    // Record transactions
    db.transactions.push({
      id: "tx-ct-stop-" + Math.random().toString(36).substr(2, 5),
      userId,
      username: user.username,
      type: "copy_trade_stop",
      amount: releaseAmount,
      description: `Terminated Copy Trading. Released ${releaseAmount} USDT to wallet.`,
      status: "completed",
      createdAt: new Date().toISOString()
    });

    db.notifications.push({
      id: "notif-ct-stop-" + Math.random().toString(36).substr(2, 5),
      userId,
      title: "Copy Trading Terminated",
      message: `${releaseAmount} USDT copy assets returned directly to your primary balance.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return res.json({ success: true, user: db.users[userIndex] });
  });

  // API - Get active traders
  app.get("/api/traders", (req, res) => {
    const db = loadDb();
    return res.json(db.traders);
  });

  // API - Fetch Transactions
  app.get("/api/transactions/:userId", (req, res) => {
    const db = loadDb();
    const userTx = db.transactions.filter((tx) => tx.userId === req.params.userId || tx.username === req.params.userId);
    // Sort reverse chronological
    userTx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(userTx);
  });

  // API - Get/Clear Notifications
  app.get("/api/notifications/:userId", (req, res) => {
    const db = loadDb();
    const list = db.notifications.filter((n) => n.userId === req.params.userId);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(list);
  });

  app.post("/api/notifications/:userId/read", (req, res) => {
    const db = loadDb();
    let updated = false;
    db.notifications.forEach((n) => {
      if (n.userId === req.params.userId) {
        n.isRead = true;
        updated = true;
      }
    });
    if (updated) {
      saveDb(db);
    }
    return res.json({ success: true });
  });

  // API - Get Referrals stats
  app.get("/api/referrals/:userId", (req, res) => {
    const db = loadDb();
    const user = db.users.find((u) => u.id === req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const referredUsers = db.users.filter((u) => u.referredBy === user.id);
    const completedReferredUsers = referredUsers.map((ru) => ({
      username: ru.username,
      fullName: ru.fullName,
      kycStatus: ru.kycStatus,
      createdAt: ru.createdAt,
      activeCopying: ru.isCopying
    }));

    // Calculate referral earnings (e.g., summation of referral bonus transactions)
    const referralBonuses = db.transactions.filter(
      (tx) => tx.userId === user.id && tx.type === "referral_bonus"
    );
    const totalBonusEarned = referralBonuses.reduce((sum, tx) => sum + tx.amount, 0);

    return res.json({
      referralCode: user.referralCode,
      referredCount: referredUsers.length,
      history: completedReferredUsers,
      totalBonusEarned
    });
  });


  /* ==========================================================================
     ADMIN PANEL ENDPOINTS
     ========================================================================== */

  // Admin - Get Users list
  app.get("/api/admin/users", (req, res) => {
    const db = loadDb();
    // Return custom mapped users profiles (excluding raw big password mappings)
    return res.json(db.users);
  });

  // Admin - Edit User Balance directly
  app.post("/api/admin/users/:userId/balance", (req, res) => {
    const { userId } = req.params;
    const { amount, type } = req.body; // type = 'primary' | 'copy' | 'profit'

    const adjustVal = parseFloat(amount);
    if (isNaN(adjustVal)) {
      return res.status(400).json({ error: "Amount must be a decimal value." });
    }

    const db = loadDb();
    const uIdx = db.users.findIndex((u) => u.id === userId);
    if (uIdx === -1) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const user = db.users[uIdx];

    if (type === "primary") {
      db.users[uIdx].balance = Math.max(0, adjustVal);
    } else if (type === "copy") {
      db.users[uIdx].copyBalance = Math.max(0, adjustVal);
    } else if (type === "profit") {
      db.users[uIdx].profit = Math.max(0, adjustVal);
    } else {
      return res.status(400).json({ error: "Invalid balances adjustment target type." });
    }

    // Record adjustment transaction
    db.transactions.push({
      id: "tx-adj-" + Math.random().toString(36).substr(2, 5),
      userId,
      username: user.username,
      type: "deposit",
      amount: adjustVal,
      description: `Admin balance adjustment on ${type} asset allocation. New balance: $${adjustVal} USDT`,
      status: "completed",
      createdAt: new Date().toISOString()
    });

    db.notifications.push({
      id: "notif-adj-" + Math.random().toString(36).substr(2, 5),
      userId,
      title: "Balance Adjusted by Admin",
      message: `Your ${type} balance asset group has been set to ${adjustVal} USDT by administrative controls.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return res.json({ success: true, user: db.users[uIdx] });
  });

  // Admin - Get KYC Submissions
  app.get("/api/admin/kyc", (req, res) => {
    const db = loadDb();
    const pendingKycUsers = db.users.filter((u) => u.kycStatus === "pending");
    return res.json(pendingKycUsers);
  });

  // Admin - Approve/Reject KYC
  app.post("/api/admin/kyc/approve", (req, res) => {
    const { userId, approve, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID required." });
    }

    const db = loadDb();
    const uIdx = db.users.findIndex((u) => u.id === userId);
    if (uIdx === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    if (approve) {
      db.users[uIdx].kycStatus = "approved";
      db.users[uIdx].kycRejectedReason = null;

      db.notifications.push({
        id: "notif-kyc-ok-" + Math.random().toString(36).substr(2, 5),
        userId,
        title: "KYC KYC Approved",
        message: "Your submission has been verified by compliance admin. Unlimited services unlocked.",
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } else {
      db.users[uIdx].kycStatus = "rejected";
      db.users[uIdx].kycRejectedReason = reason || "Submitted documents were illegible.";

      db.notifications.push({
        id: "notif-kyc-fail-" + Math.random().toString(36).substr(2, 5),
        userId,
        title: "KYC Verification Rejected",
        message: `Reason: ${reason || "Submitted documents were illegible."}. Re-upload correct images to re-submit.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    return res.json({ success: true, user: db.users[uIdx] });
  });

  // Admin - Get Deposits list
  app.get("/api/admin/deposits", (req, res) => {
    const db = loadDb();
    return res.json(db.deposits);
  });

  // Admin - Approve/Reject Deposit Requests
  app.post("/api/admin/deposits/approve", (req, res) => {
    const { depositId, approve } = req.body;

    if (!depositId) {
      return res.status(400).json({ error: "Deposit request identification ID required." });
    }

    const db = loadDb();
    const depIndex = db.deposits.findIndex((d) => d.id === depositId);
    if (depIndex === -1) {
      return res.status(404).json({ error: "Deposit request not found." });
    }

    const deposit = db.deposits[depIndex];
    if (deposit.status !== "pending") {
      return res.status(400).json({ error: "This deposit audit is already finalized." });
    }

    const userIndex = db.users.findIndex((u) => u.id === deposit.userId);
    if (userIndex === -1) {
      return res.status(444).json({ error: "Associated user record missing." });
    }

    const userObj = db.users[userIndex];

    if (approve) {
      db.deposits[depIndex].status = "approved";
      db.users[userIndex].balance += deposit.amount;

      // Update the transaction log status
      const txIndex = db.transactions.findIndex((tx) => tx.id === "tx-dep-" + depositId);
      if (txIndex !== -1) {
        db.transactions[txIndex].status = "completed";
        db.transactions[txIndex].description = `Approved USDT TRC20 Deposit ($${deposit.amount})`;
      }

      // Referral system bonus: 5% bonus to referrer for ANY approved deposit if user has registered with referral code
      if (userObj.referredBy) {
        const refUserIndex = db.users.findIndex((u) => u.id === userObj.referredBy);
        if (refUserIndex !== -1) {
          const refererBonus = deposit.amount * 0.05;
          db.users[refUserIndex].balance += refererBonus;

          // Record referral transaction for the sponsor
          db.transactions.push({
            id: "tx-ref-bonus-" + depositId + "-" + Math.random().toString(36).substr(2, 4),
            userId: userObj.referredBy,
            username: db.users[refUserIndex].username,
            type: "referral_bonus",
            amount: refererBonus,
            description: `5% Team Deposit Commission from ${userObj.username}`,
            status: "completed",
            createdAt: new Date().toISOString()
          });

          // Notify the sponsor
          db.notifications.push({
            id: "notif-ref-bonus-" + Math.random().toString(36).substr(2, 5),
            userId: userObj.referredBy,
            title: "Referral Bonus Credited",
            message: `Earned $${refererBonus} USDT as a 5% deposit affiliate bonus from ${userObj.fullName}'s top-up.`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Notify the depositor
      db.notifications.push({
        id: "notif-dep-ok-" + depositId,
        userId: deposit.userId,
        title: "USDT Top-up Approved",
        message: `Your deposit request for ${deposit.amount} USDT has been validated. Funds are credited to your principal balance.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

    } else {
      db.deposits[depIndex].status = "rejected";

      // Mark request failed in ledger history
      const txIndex = db.transactions.findIndex((tx) => tx.id === "tx-dep-" + depositId);
      if (txIndex !== -1) {
        db.transactions[txIndex].status = "failed";
        db.transactions[txIndex].description = `Rejected USDT TRC20 Deposit - Invalid / Duplicate TXID`;
      }

      db.notifications.push({
        id: "notif-dep-fail-" + depositId,
        userId: deposit.userId,
        title: "Deposit Audit Failed",
        message: `Your USDT TRC20 deposit of ${deposit.amount} USDT (TXID: ${deposit.txid}) was rejected by administrative verify logic. Verify transaction TXID/ledger proof.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    return res.json({ success: true, deposit: db.deposits[depIndex], user: db.users[userIndex] });
  });

  // Admin - Get Withdrawals list
  app.get("/api/admin/withdrawals", (req, res) => {
    const db = loadDb();
    return res.json(db.withdrawals);
  });

  // Admin - Approve/Reject Withdrawal Requests
  app.post("/api/admin/withdrawals/approve", (req, res) => {
    const { withdrawalId, approve } = req.body;

    if (!withdrawalId) {
      return res.status(400).json({ error: "Withdrawal reference ID required." });
    }

    const db = loadDb();
    const withIdx = db.withdrawals.findIndex((w) => w.id === withdrawalId);
    if (withIdx === -1) {
      return res.status(404).json({ error: "Withdrawal request not found." });
    }

    const withdrawal = db.withdrawals[withIdx];
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: "Withdrawal status already locked." });
    }

    const userIndex = db.users.findIndex((u) => u.id === withdrawal.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Associated user profile deleted." });
    }

    const user = db.users[userIndex];

    if (approve) {
      db.withdrawals[withIdx].status = "approved";

      // Complete transaction ledger entry
      const txIndex = db.transactions.findIndex((tx) => tx.id === "tx-with-" + withdrawalId);
      if (txIndex !== -1) {
        db.transactions[txIndex].status = "completed";
        db.transactions[txIndex].description = `TRC20 Withdrawal Approved ($${withdrawal.amount})`;
      }

      db.notifications.push({
        id: "notif-with-ok-" + withdrawalId,
        userId: withdrawal.userId,
        title: "Withdrawal Cleared Successfully",
        message: `Your withdrawal file for ${withdrawal.amount} USDT to TRC20 destination (${withdrawal.address.substring(0,8)}...) has been approved. Blockchain payout triggered.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

    } else {
      db.withdrawals[withIdx].status = "rejected";
      // Return funds back to the user account balance safely since they were held
      db.users[userIndex].balance += withdrawal.amount;

      // Fail transaction ledger entry
      const txIndex = db.transactions.findIndex((tx) => tx.id === "tx-with-" + withdrawalId);
      if (txIndex !== -1) {
        db.transactions[txIndex].status = "failed";
        db.transactions[txIndex].description = `TRC20 Withdrawal Rejected - Returned to Wallet`;
      }

      db.notifications.push({
        id: "notif-with-fail-" + withdrawalId,
        userId: withdrawal.userId,
        title: "Withdrawal Rejected",
        message: `Your TRC20 withdrawal request for ${withdrawal.amount} USDT was audited & rejected. Funds has been credit-reversed to your primary balance.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    return res.json({ success: true, withdrawal: db.withdrawals[withIdx], user: db.users[userIndex] });
  });

  // Admin - Add Daily Profits percentage to all active copy-trading copiers
  app.post("/api/admin/profits/add", (req, res) => {
    const { percentage } = req.body;
    const profitRate = parseFloat(percentage);

    if (isNaN(profitRate) || profitRate <= 0) {
      return res.status(400).json({ error: "Daily profitability rate must be a positive percentage number." });
    }

    const db = loadDb();
    const factor = profitRate / 100;

    let totalProfitsDistributed = 0;
    let distributedCount = 0;

    // Apply percentage additions directly to copyBalance and profit values of ALL active copier users!
    db.users.forEach((user, index) => {
      if (user.isCopying && user.copyBalance > 0) {
        const accruedInterest = user.copyBalance * factor;
        const formattedAccrued = parseFloat(accruedInterest.toFixed(2));

        db.users[index].copyBalance = parseFloat((user.copyBalance + formattedAccrued).toFixed(2));
        db.users[index].profit = parseFloat((user.profit + formattedAccrued).toFixed(2));

        totalProfitsDistributed += formattedAccrued;
        distributedCount += 1;

        // Record individual transaction logs
        db.transactions.push({
          id: "tx-cp-earn-" + Math.random().toString(36).substr(2, 5),
          userId: user.id,
          username: user.username,
          type: "copy_trade_profit",
          amount: formattedAccrued,
          description: `Accrued daily returns index (+${profitRate}%) - Strategy Profit Share`,
          status: "completed",
          createdAt: new Date().toISOString()
        });

        // Push individual notification
        db.notifications.push({
          id: "notif-cp-earn-" + Math.random().toString(36).substr(2, 5),
          userId: user.id,
          title: "Daily Profit Accrued",
          message: `Your copy trade allocation has grown by $${formattedAccrued} USDT (+${profitRate}% target return).`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Record the global profit event summary index
    db.dailyProfitHistory.push({
      id: "prof-hist-" + Math.random().toString(36).substr(2, 9),
      percentage: profitRate,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return res.json({
      success: true,
      percentage: profitRate,
      distributedCount,
      totalProfitsDistributed: parseFloat(totalProfitsDistributed.toFixed(2))
    });
  });

  // Admin - Fetch Stats Dashboard
  app.get("/api/admin/stats", (req, res) => {
    const db = loadDb();

    const totalUsers = db.users.length;
    let totalDeposited = 0;
    let totalWithdrawn = 0;

    // Calculate deposits based on approved transactions / state
    db.deposits.forEach((dep) => {
      if (dep.status === "approved") {
        totalDeposited += dep.amount;
      }
    });

    db.withdrawals.forEach((wit) => {
      if (wit.status === "approved") {
        totalWithdrawn += wit.amount;
      }
    });

    const activeCopiers = db.users.filter((u) => u.isCopying).length;

    // Sum user aggregate total profit values
    const totalCompanyProfitPaid = db.users.reduce((acc, u) => acc + u.profit, 0);

    const stats: Stats = {
      totalUsers,
      totalDeposited: parseFloat(totalDeposited.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      activeCopiers,
      totalCompanyProfitPaid: parseFloat(totalCompanyProfitPaid.toFixed(2))
    };

    return res.json({
      stats,
      totalPendingKyc: db.users.filter((u) => u.kycStatus === "pending").length,
      totalPendingDeposits: db.deposits.filter((d) => d.status === "pending").length,
      totalPendingWithdrawals: db.withdrawals.filter((w) => w.status === "pending").length,
      profitHistory: db.dailyProfitHistory
    });
  });


  /* ==========================================================================
     VITE INTEGRATION AND ROOT FALLBACK
     ========================================================================== */

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Trade Profit Hub API] full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
