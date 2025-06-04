import { useState } from "react";
import { useClient } from "./useClient";
import { createNewWallet, importWalletFromMnemonic, validateMnemonic } from "../wallet";
import { coin, GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
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
    console.log("🔄 Importing wallet...");
    
    try {
      // 🆕 Thêm validation cho mnemonic
      if (!mnemonic || typeof mnemonic !== 'string') {
        throw new Error('Invalid mnemonic: mnemonic is required');
      }

      validateMnemonic(mnemonic);
      
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        mnemonic,
        { prefix: BLOCKCHAIN_CONFIG.addressPrefix }
      );

      const [firstAccount] = await wallet.getAccounts();
      
      // 🔄 Sử dụng client.connectWithWallet thay vì gán trực tiếp
      await client.connectWithWallet(wallet);

      console.log("✅ Wallet imported successfully:", firstAccount.address);
      return firstAccount.address;
      
    } catch (error: any) {
      console.error("❌ Failed to import wallet:", error);
      throw error;
    }
  };

const getBalance = async (address: string) => {
  try {
    console.log("💰 Getting balance for:", address);
    
    // 🔄 Method 1: Try direct REST API call first (không cần wallet connection)
    try {
      const restEndpoint = `${BLOCKCHAIN_CONFIG.restEndpoint}/cosmos/bank/v1beta1/balances/${address}`;
      console.log("🔄 Trying direct REST call:", restEndpoint);
      
      const response = await fetch(restEndpoint);
      if (response.ok) {
        const data = await response.json();
        console.log("📊 REST balance response:", data);
        
        const balances = data.balances || [];
        const targetBalance = balances.find(
          (bal: any) => bal.denom === BLOCKCHAIN_CONFIG.currency.coinMinimalDenom
        );

        if (targetBalance) {
          const amount = targetBalance.amount;
          const readable = `${(parseInt(amount) / Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toFixed(6)} ${BLOCKCHAIN_CONFIG.currency.coinDenom}`;
          
          console.log("💎 Direct REST balance:", { amount, readable });
          return {
            amount: amount,
            denom: targetBalance.denom,
            readable: readable,
          };
        } else {
          // No balance found for this denom = zero balance
          console.log("💎 No balance found, returning zero");
          return {
            amount: "0",
            denom: BLOCKCHAIN_CONFIG.currency.coinMinimalDenom,
            readable: `0 ${BLOCKCHAIN_CONFIG.currency.coinDenom}`,
          };
        }
      }
    } catch (restError) {
      console.warn("⚠️ Direct REST balance failed:", restError);
    }
    
    // 🔄 Method 2: Try with connected client if available
    if (client.client) {
      try {
        const balance = await client.client.getBalance(
          address, 
          BLOCKCHAIN_CONFIG.currency.coinMinimalDenom
        );
        
        console.log("💎 Connected client balance:", balance);
        return {
          amount: balance.amount,
          denom: balance.denom,
          readable: `${(parseInt(balance.amount) / Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toFixed(6)} ${BLOCKCHAIN_CONFIG.currency.coinDenom}`,
        };
      } catch (clientError) {
        console.warn("⚠️ Connected client balance failed:", clientError);
      }
    }
    
    // 🔄 Method 3: Try alternative REST endpoints
    const altEndpoints = [
      `${BLOCKCHAIN_CONFIG.restEndpoint}/bank/balances/${address}`,
      `${BLOCKCHAIN_CONFIG.restEndpoint}/cosmos/bank/v1beta1/balances/${address}/${BLOCKCHAIN_CONFIG.currency.coinMinimalDenom}`,
    ];

    for (const endpoint of altEndpoints) {
      try {
        console.log("🔄 Trying alternative endpoint:", endpoint);
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          console.log("📊 Alternative endpoint response:", data);
          
          // Handle different response formats
          if (data.balance) {
            // Single balance response
            const balance = data.balance;
            const readable = `${(parseInt(balance.amount) / Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toFixed(6)} ${BLOCKCHAIN_CONFIG.currency.coinDenom}`;
            return {
              amount: balance.amount,
              denom: balance.denom,
              readable: readable,
            };
          } else if (data.balances) {
            // Multiple balances response
            const targetBalance = data.balances.find(
              (bal: any) => bal.denom === BLOCKCHAIN_CONFIG.currency.coinMinimalDenom
            );
            if (targetBalance) {
              const readable = `${(parseInt(targetBalance.amount) / Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toFixed(6)} ${BLOCKCHAIN_CONFIG.currency.coinDenom}`;
              return {
                amount: targetBalance.amount,
                denom: targetBalance.denom,
                readable: readable,
              };
            }
          }
        }
      } catch (error) {
        console.warn("⚠️ Alternative endpoint failed:", endpoint, error);
      }
    }
    
    // 🔄 Method 4: Try RPC query as last resort
    try {
      console.log("🔄 Trying RPC balance query...");
      const rpcEndpoint = `${BLOCKCHAIN_CONFIG.rpcEndpoint}/abci_query`;
      
      // Create a simple query (simplified, not full protobuf)
      const queryPath = "/cosmos.bank.v1beta1.Query/Balance";
      const queryData = btoa(JSON.stringify({ address, denom: BLOCKCHAIN_CONFIG.currency.coinMinimalDenom }));
      
      const rpcUrl = `${rpcEndpoint}?path="${encodeURIComponent(queryPath)}"&data="${queryData}"`;
      
      const response = await fetch(rpcUrl);
      if (response.ok) {
        const data = await response.json();
        console.log("📊 RPC balance response:", data);
        
        // RPC responses need decoding, for now return zero as fallback
        console.log("⚠️ RPC balance decoding not implemented, using zero");
      }
    } catch (rpcError) {
      console.warn("⚠️ RPC balance query failed:", rpcError);
    }
    
    // Final fallback - return zero balance
    console.log("💎 All methods failed, returning zero balance");
    return {
      amount: "0",
      denom: BLOCKCHAIN_CONFIG.currency.coinMinimalDenom,
      readable: `0 ${BLOCKCHAIN_CONFIG.currency.coinDenom}`,
    };
    
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

    // Convert amount to micro units
    const microAmount = (parseFloat(amount) * Math.pow(10, BLOCKCHAIN_CONFIG.currency.coinDecimals)).toString();
    const sendAmount = coin(microAmount, BLOCKCHAIN_CONFIG.currency.coinMinimalDenom);

    // 🆕 Proper gas price configuration
    const gasPrice = GasPrice.fromString(`0.025${BLOCKCHAIN_CONFIG.currency.coinMinimalDenom}`);
    
    console.log("🔄 Transaction details:");
    console.log("  From:", fromAddress);
    console.log("  To:", toAddress);
    console.log("  Amount:", sendAmount);
    console.log("  Gas Price:", gasPrice);
    
    // 🆕 Use explicit gas configuration instead of "auto"
    const result = await client.client.sendTokens(
      fromAddress,
      toAddress,
      [sendAmount],
      {
        amount: [coin("5000", BLOCKCHAIN_CONFIG.currency.coinMinimalDenom)], // Fixed fee
        gas: "200000", // Fixed gas limit
      },
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

const getTransactionHistory = async (address: string, limit: number = 10) => {
  console.log("📜 Getting transaction history for:", address, "limit:", limit);
  setError(null);

  try {
    // 🆕 Chỉ sử dụng RPC vì nó hoạt động tốt
    console.log("🔄 Using RPC method only...");
    
    const rpcData = await getTransactionHistoryRPC(address, limit);
    if (rpcData && rpcData.length > 0) {
      console.log("✅ Got transactions from RPC");
      return rpcData;
    }
    
    console.log("ℹ️ No transaction history found");
    return [];

  } catch (error: any) {
    console.error("❌ Failed to get transaction history:", error);
    setError(error.message);
    return [];
  }
};


// REST API method
const getTransactionHistoryREST = async (address: string, limit: number = 10) => {
  const restEndpoints = [
    // Modern Cosmos SDK endpoints (v0.45+) với limit
    `${BLOCKCHAIN_CONFIG.restEndpoint}/cosmos/tx/v1beta1/txs?events=transfer.recipient%3D%27${address}%27&pagination.limit=${limit}`,
    `${BLOCKCHAIN_CONFIG.restEndpoint}/cosmos/tx/v1beta1/txs?events=transfer.sender%3D%27${address}%27&pagination.limit=${limit}`,
    
    // Legacy endpoints - skip these if they return 501
    // `${BLOCKCHAIN_CONFIG.restEndpoint}/txs?transfer.recipient=${address}&limit=${limit}`,
    // `${BLOCKCHAIN_CONFIG.restEndpoint}/txs?transfer.sender=${address}&limit=${limit}`,
  ];

  for (const endpoint of restEndpoints) {
    try {
      console.log("🔍 Trying REST endpoint:", endpoint);
      const response = await fetch(endpoint);
      
      // 🆕 Skip 501 Not Implemented errors
      if (response.status === 501) {
        console.log("⚠️ Endpoint not implemented, skipping:", endpoint);
        continue;
      }
      
      // 🆕 Skip 500 Internal Server Error
      if (response.status === 500) {
        console.log("⚠️ Server error, skipping:", endpoint);
        continue;
      }
      
      if (response.ok) {
        const data = await response.json();
        // 🆕 Process and format transactions with limit
        if (data.txs || data.tx_responses) {
          const txs = data.txs || data.tx_responses || [];
          return formatTransactions(txs, address, limit);
        }
        return [];
      }
    } catch (error) {
      console.warn("⚠️ REST endpoint failed:", endpoint, error);
      continue;
    }
  }
  
  return []; // All REST endpoints failed
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
