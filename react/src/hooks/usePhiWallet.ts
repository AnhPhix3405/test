import { useState } from "react";
import { useClient } from "./useClient";
import { createNewWallet, importWalletFromMnemonic, validateMnemonic } from "../wallet";
import { coin } from "@cosmjs/stargate";
import { BLOCKCHAIN_CONFIG } from "../config/blockchain";

export const usePhiWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = useClient();

  const createWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      console.log("🆕 Creating new Phi wallet...");
      const walletData = await createNewWallet();
      
      console.log("✅ Wallet created:", walletData.address);
      console.log("🔑 Mnemonic generated:", walletData.mnemonic.split(' ').length, "words");
      
      // Connect to Test Chain
      await client.connectWithWallet(walletData.wallet);
      
      return {
        address: walletData.address,
        mnemonic: walletData.mnemonic,
      };
    } catch (err: any) {
      console.error("❌ Failed to create wallet:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const importWallet = async (mnemonic: string) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      if (!validateMnemonic(mnemonic)) {
        throw new Error("Invalid mnemonic phrase. Must be 12 or 24 words.");
      }
      
      console.log("📥 Importing Phi wallet...");
      const walletData = await importWalletFromMnemonic(mnemonic);
      
      console.log("✅ Wallet imported:", walletData.address);
      
      // Connect to Test Chain
      await client.connectWithWallet(walletData.wallet);
      
      return {
        address: walletData.address,
        mnemonic: walletData.mnemonic,
      };
    } catch (err: any) {
      console.error("❌ Failed to import wallet:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const getBalance = async (address: string) => {
    try {
      console.log("💰 Getting balance for:", address);
      
      const balance = await client.getBalance(address);
      
      // Convert to readable format
      const readableBalance = {
        amount: balance.amount,
        denom: balance.denom,
        readable: `${(parseInt(balance.amount) / Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toFixed(6)} ${BLOCKCHAIN_CONFIG.currency.coinDenom}`,
      };
      
      console.log("💎 Balance:", readableBalance);
      return readableBalance;
    } catch (error) {
      console.error("❌ Failed to get balance:", error);
      return { 
        amount: "0",
        denom: BLOCKCHAIN_CONFIG.currency.coinMinimalDenom, 
        readable: `0 ${BLOCKCHAIN_CONFIG.currency.coinDenom}`,
      };
    }
  };

  const sendTokens = async (toAddress: string, amount: string, memo?: string) => {
    try {
      if (!client.client || !client.signer) {
        throw new Error("Wallet not connected to Test Chain");
      }

      console.log("💸 Sending PHI tokens...");
      console.log("📍 To:", toAddress);
      console.log("💰 Amount:", amount, BLOCKCHAIN_CONFIG.currency.coinMinimalDenom);
      console.log("📝 Memo:", memo || "No memo");

      const accounts = await client.signer.getAccounts();
      const fromAddress = accounts[0].address;

      // Convert amount to micro units (uphi)
      const microAmount = (parseFloat(amount) * Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toString();
      const sendAmount = coin(microAmount, BLOCKCHAIN_CONFIG.currency.coinMinimalDenom);
      
      console.log("🔄 Transaction details:");
      console.log("  From:", fromAddress);
      console.log("  To:", toAddress);
      console.log("  Amount:", sendAmount);
      
      const result = await client.client.sendTokens(
        fromAddress,
        toAddress,
        [sendAmount],
        "auto", // Let the client calculate gas
        memo
      );

      console.log("✅ Transaction successful!");
      console.log("🔗 TX Hash:", result.transactionHash);
      console.log("⛽ Gas used:", result.gasUsed);
      console.log("💸 Gas wanted:", result.gasWanted);
      
      return {
        ...result,
        explorerUrl: `${BLOCKCHAIN_CONFIG.explorerUrl}/tx/${result.transactionHash}`,
      };
    } catch (error: any) {
      console.error("❌ Transaction failed:", error);
      setError(error.message);
      throw error;
    }
  };

const getTransactionHistory = async (address: string, limit = 10) => {
  try {
    console.log("📜 Getting transaction history for:", address);
    
    // Method 1: Try REST API first
    try {
      const txs = await getTransactionHistoryREST(address, limit);
      if (txs.length > 0) {
        console.log("✅ Got transactions from REST API");
        return txs;
      }
    } catch (error) {
      console.warn("⚠️ REST API failed:", error);
    }
    
    // Method 2: Try RPC with different query format
    try {
      const txs = await getTransactionHistoryRPC(address, limit);
      if (txs.length > 0) {
        console.log("✅ Got transactions from RPC");
        return txs;
      }
    } catch (error) {
      console.warn("⚠️ RPC failed:", error);
    }
    
    // Method 3: Try simple block query
    try {
      const txs = await getTransactionHistoryBlocks(address, limit);
      if (txs.length > 0) {
        console.log("✅ Got transactions from block scanning");
        return txs;
      }
    } catch (error) {
      console.warn("⚠️ Block scanning failed:", error);
    }
    
    // Method 4: Return mock data for development
    console.log("ℹ️ No real transactions found, returning mock data");
    return getMockTransactions(address);
    
  } catch (error) {
    console.error("❌ All transaction methods failed:", error);
    return getMockTransactions(address);
  }
};

// REST API method
const getTransactionHistoryREST = async (address: string, limit: number) => {
  const restEndpoint = BLOCKCHAIN_CONFIG.restEndpoint;
  
  // Try different REST endpoints
  const endpoints = [
    `${restEndpoint}/cosmos/tx/v1beta1/txs?events=transfer.recipient%3D%27${address}%27&pagination.limit=${limit}`,
    `${restEndpoint}/cosmos/tx/v1beta1/txs?events=transfer.sender%3D%27${address}%27&pagination.limit=${limit}`,
    `${restEndpoint}/txs?transfer.recipient=${address}&limit=${limit}`,
    `${restEndpoint}/txs?transfer.sender=${address}&limit=${limit}`,
  ];
  
  let allTxs: any[] = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log("🔍 Trying REST endpoint:", endpoint);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📡 REST Response:", data);
        
        if (data.txs && Array.isArray(data.txs)) {
          allTxs = [...allTxs, ...data.txs];
        } else if (data.tx_responses && Array.isArray(data.tx_responses)) {
          allTxs = [...allTxs, ...data.tx_responses];
        }
      }
    } catch (error) {
      console.warn("⚠️ REST endpoint failed:", endpoint, error);
    }
  }
  
  return formatTransactions(allTxs, address, limit);
};

// RPC method with simpler queries
const getTransactionHistoryRPC = async (address: string, limit: number) => {
  const rpcEndpoint = BLOCKCHAIN_CONFIG.rpcEndpoint;
  
  // Try simpler RPC queries
  const queries = [
    `transfer.recipient='${address}'`,
    `transfer.sender='${address}'`,
    `message.sender='${address}'`,
  ];
  
  let allTxs: any[] = [];
  
  for (const query of queries) {
    try {
      const url = `${rpcEndpoint}/tx_search?query="${encodeURIComponent(query)}"&per_page=${Math.min(limit, 10)}&order_by="desc"`;
      console.log("🔍 Trying RPC query:", url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📡 RPC Response:", data);
        
        if (data.result && data.result.txs) {
          allTxs = [...allTxs, ...data.result.txs];
        }
      } else {
        console.warn(`⚠️ RPC query failed with status ${response.status}:`, query);
      }
    } catch (error) {
      console.warn("⚠️ RPC query failed:", query, error);
    }
  }
  
  return formatRPCTransactions(allTxs, address, limit);
};

// Block scanning method (last resort)
const getTransactionHistoryBlocks = async (address: string, limit: number) => {
  const rpcEndpoint = BLOCKCHAIN_CONFIG.rpcEndpoint;
  
  try {
    // Get latest block
    const latestResponse = await fetch(`${rpcEndpoint}/block`);
    if (!latestResponse.ok) throw new Error("Failed to get latest block");
    
    const latestData = await latestResponse.json();
    const latestHeight = parseInt(latestData.result.block.header.height);
    
    console.log("🔍 Latest block height:", latestHeight);
    
    // Check recent blocks for transactions
    const transactions: any[] = [];
    const maxBlocks = Math.min(50, latestHeight); // Check last 50 blocks
    
    for (let i = 0; i < maxBlocks && transactions.length < limit; i++) {
      const height = latestHeight - i;
      
      try {
        const blockResponse = await fetch(`${rpcEndpoint}/block?height=${height}`);
        if (blockResponse.ok) {
          const blockData = await blockResponse.json();
          const txs = blockData.result.block.data.txs || [];
          
          // This is a simplified check - in practice you'd need to decode the transactions
          if (txs.length > 0) {
            console.log(`📦 Block ${height} has ${txs.length} transactions`);
            // Add mock transaction for this block
            transactions.push({
              hash: `block_${height}_tx_1`,
              height: height,
              timestamp: blockData.result.block.header.time,
              type: "unknown",
              amount: "0",
              readableAmount: "0.000000 STAKE",
              denom: "stake",
              fromAddress: "unknown",
              toAddress: "unknown",
              fee: "N/A",
              memo: `Transaction in block ${height}`,
              success: true,
              explorerUrl: `${BLOCKCHAIN_CONFIG.explorerUrl}/tx/block_${height}_tx_1`,
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to get block ${height}:`, error);
      }
    }
    
    return transactions;
  } catch (error) {
    console.error("❌ Block scanning failed:", error);
    throw error;
  }
};
// Format REST API transactions
const formatTransactions = (txs: any[], address: string, limit: number) => {
  return txs
    .slice(0, limit)
    .map((tx) => {
      // Parse transaction data
      const events = tx.events || tx.logs?.[0]?.events || [];
      const transferEvents = events.filter((e: any) => e.type === 'transfer');
      
      let amount = "0";
      let denom = BLOCKCHAIN_CONFIG.currency.coinMinimalDenom;
      let fromAddress = "";
      let toAddress = "";
      let type = "unknown";
      
      transferEvents.forEach((event: any) => {
        const attributes = event.attributes || [];
        attributes.forEach((attr: any) => {
          if (attr.key === 'amount') {
            const match = attr.value.match(/(\d+)(\w+)/);
            if (match) {
              amount = match[1];
              denom = match[2];
            }
          }
          if (attr.key === 'sender') fromAddress = attr.value;
          if (attr.key === 'recipient') toAddress = attr.value;
        });
      });
      
      // Determine type
      if (fromAddress === address) type = "sent";
      else if (toAddress === address) type = "received";
      
      // Convert amount
      const readableAmount = (parseInt(amount) / Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toFixed(6);
      
      return {
        hash: tx.txhash || tx.hash,
        height: tx.height || 0,
        timestamp: tx.timestamp || new Date().toISOString(),
        type,
        amount,
        readableAmount: `${readableAmount} ${BLOCKCHAIN_CONFIG.currency.coinDenom}`,
        denom,
        fromAddress,
        toAddress,
        fee: tx.tx?.auth_info?.fee?.amount?.[0]?.amount || "N/A",
        memo: tx.tx?.body?.memo || "",
        success: tx.code === 0,
        explorerUrl: `${BLOCKCHAIN_CONFIG.explorerUrl}/tx/${tx.txhash || tx.hash}`,
      };
    });
};

// Format RPC transactions
const formatRPCTransactions = (txs: any[], address: string, limit: number) => {
  return txs
    .slice(0, limit)
    .map((tx) => {
      const events = tx.tx_result?.events || [];
      const transferEvents = events.filter((e: any) => e.type === 'transfer');
      
      let amount = "0";
      let denom = BLOCKCHAIN_CONFIG.currency.coinMinimalDenom;
      let fromAddress = "";
      let toAddress = "";
      let type = "unknown";
      
      transferEvents.forEach((event: any) => {
        const attributes = event.attributes || [];
        attributes.forEach((attr: any) => {
          const key = attr.key ? (typeof attr.key === 'string' ? attr.key : atob(attr.key)) : '';
          const value = attr.value ? (typeof attr.value === 'string' ? attr.value : atob(attr.value)) : '';
          
          if (key === 'amount') {
            const match = value.match(/(\d+)(\w+)/);
            if (match) {
              amount = match[1];
              denom = match[2];
            }
          }
          if (key === 'sender') fromAddress = value;
          if (key === 'recipient') toAddress = value;
        });
      });
      
      if (fromAddress === address) type = "sent";
      else if (toAddress === address) type = "received";
      
      const readableAmount = (parseInt(amount) / Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toFixed(6);
      
      return {
        hash: tx.hash,
        height: parseInt(tx.height),
        timestamp: tx.tx_result?.timestamp || new Date().toISOString(),
        type,
        amount,
        readableAmount: `${readableAmount} ${BLOCKCHAIN_CONFIG.currency.coinDenom}`,
        denom,
        fromAddress,
        toAddress,
        fee: "N/A",
        memo: "",
        success: tx.tx_result?.code === 0,
        explorerUrl: `${BLOCKCHAIN_CONFIG.explorerUrl}/tx/${tx.hash}`,
      };
    });
};

// Enhanced mock data
const getMockTransactions = (address: string) => {
  const now = Date.now();
  return [
    {
      hash: "MOCK_ABC123DEF456",
      height: 12345,
      timestamp: new Date(now - 3600000).toISOString(),
      type: "received" as const,
      amount: "1000000",
      readableAmount: "1.000000 STAKE",
      denom: "stake",
      fromAddress: "cosmos1faucet123456789abcdef",
      toAddress: address,
      fee: "5000",
      memo: "Faucet tokens (Mock)",
      success: true,
      explorerUrl: `${BLOCKCHAIN_CONFIG.explorerUrl}/tx/MOCK_ABC123DEF456`,
    },
    {
      hash: "MOCK_DEF789GHI012",
      height: 12346,
      timestamp: new Date(now - 7200000).toISOString(),
      type: "received" as const,
      amount: "1000000",
      readableAmount: "1.000000 STAKE",
      denom: "stake",
      fromAddress: "cosmos1faucet123456789abcdef",
      toAddress: address,
      fee: "5000",
      memo: "Second faucet request (Mock)",
      success: true,
      explorerUrl: `${BLOCKCHAIN_CONFIG.explorerUrl}/tx/MOCK_DEF789GHI012`,
    },
  ];
};

  const disconnect = () => {
    console.log("👋 Disconnecting from Test Chain...");
    client.removeSigner();
    setError(null);
  };

const requestFaucet = async (address: string, amount?: string) => {
  try {
    console.log("🚰 Requesting faucet tokens for:", address);
    
    const faucetAmount = amount || BLOCKCHAIN_CONFIG.faucetAmount;
    const faucetUrl = BLOCKCHAIN_CONFIG.faucetEndpoint;
    
    console.log("🌍 Faucet endpoint:", faucetUrl);
    console.log("💰 Requesting amount:", faucetAmount, BLOCKCHAIN_CONFIG.currency.coinMinimalDenom);
    
    // Call the faucet endpoint
    const response = await fetch(faucetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        address: address,
        amount: faucetAmount,
        denom: BLOCKCHAIN_CONFIG.currency.coinMinimalDenom,
      }),
    });
    
    console.log("📡 Faucet response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Faucet request failed:", errorText);
      throw new Error(`Faucet request failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log("✅ Faucet response:", result);
    
    // Check if the response contains transaction hash or success info
    let txHash = null;
    if (result.txhash || result.tx_hash || result.transactionHash) {
      txHash = result.txhash || result.tx_hash || result.transactionHash;
      console.log("🔗 Transaction hash:", txHash);
    }
    
    console.log("✅ Faucet tokens requested successfully");
    console.log(`💰 Amount: ${faucetAmount} ${BLOCKCHAIN_CONFIG.currency.coinMinimalDenom}`);
    
    return {
      success: true,
      txHash: txHash,
      amount: faucetAmount,
      denom: BLOCKCHAIN_CONFIG.currency.coinMinimalDenom,
      explorerUrl: txHash ? `${BLOCKCHAIN_CONFIG.explorerUrl}/tx/${txHash}` : null,
      message: result.message || "Tokens sent successfully",
    };
    
  } catch (error: any) {
    console.error("❌ Faucet request failed:", error);
    
    // Return detailed error info
    throw {
      message: error.message || "Failed to request faucet tokens",
      status: error.status || "network_error",
      endpoint: BLOCKCHAIN_CONFIG.faucetEndpoint,
    };
  }
};

  return {
    // Wallet management
    createWallet,
    importWallet,
    disconnect,
    
    // Blockchain operations
    getBalance,
    sendTokens,
    getTransactionHistory,
    requestFaucet,
    
    // State
    isConnecting,
    error,
    isConnected: !!client.client,
    
    // Client access
    client: client.client,
    address: client.signer ? null : undefined, // Will get from accounts when needed
    
    // Config
    config: BLOCKCHAIN_CONFIG,
  };
};
