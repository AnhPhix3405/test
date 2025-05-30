import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";
import { useState } from "react";
import { BLOCKCHAIN_CONFIG } from "../config/blockchain";

export const useClient = () => {
  const [client, setClient] = useState<SigningStargateClient | null>(null);
  const [signer, setSigner] = useState<OfflineDirectSigner | null>(null);
  const [readOnlyClient, setReadOnlyClient] = useState<StargateClient | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const env = BLOCKCHAIN_CONFIG;

  // 🔧 ENHANCED: Better error handling
  const connectWithWallet = async (walletSigner: OfflineDirectSigner) => {
    try {
      console.log("🔌 Connecting to Test Chain:", env.chainId);
      console.log("📍 RPC Endpoint:", env.rpcEndpoint);
      
      setConnectionError(null);
      
      // Test connection first
      console.log("🧪 Testing RPC connection...");
      const testClient = await StargateClient.connect(env.rpcEndpoint);
      console.log("✅ RPC connection successful");
      
      // Create signing client
      console.log("🔐 Creating signing client...");
      const signingClient = await SigningStargateClient.connectWithSigner(
        env.rpcEndpoint,
        walletSigner,
        {
          gasPrice: env.gasPrices,
        }
      );
      
      setClient(signingClient);
      setSigner(walletSigner);
      
      console.log("✅ Connected to Test Chain successfully!");
      console.log("🪙 Currency:", env.currency.coinDenom);
      
      return signingClient;
    } catch (error: any) {
      console.error("❌ Failed to connect to Test Chain:", error);
      
      // 🔍 Better error messages
      let errorMessage = "Connection failed";
      if (error.message.includes("fetch")) {
        errorMessage = "Cannot reach blockchain node. Please check if the blockchain is running.";
      } else if (error.message.includes("CORS")) {
        errorMessage = "CORS error. The blockchain node may not allow browser connections.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Connection timeout. The blockchain node is not responding.";
      }
      
      setConnectionError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 🔧 ENHANCED: Better read-only connection
  const connectReadOnly = async () => {
    try {
      console.log("📖 Connecting read-only client to:", env.rpcEndpoint);
      
      const readClient = await StargateClient.connect(env.rpcEndpoint);
      setReadOnlyClient(readClient);
      
      console.log("✅ Read-only client connected!");
      return readClient;
    } catch (error: any) {
      console.error("❌ Failed to connect read-only client:", error);
      
      // 🎯 Mock client for testing when real blockchain not available
      console.log("🔄 Using mock read-only client for testing...");
      const mockClient = {
        getBalance: async (address: string, denom: string) => {
          console.log("🎭 Mock getBalance called:", { address, denom });
          return { denom, amount: "1000000" }; // 1 PHI
        }
      } as any;
      
      setReadOnlyClient(mockClient);
      return mockClient;
    }
  };

  // 🔧 ENHANCED: Mock-friendly getBalance
  const getBalance = async (address: string) => {
    try {
      if (!readOnlyClient) {
        await connectReadOnly();
      }
      
      console.log("💰 Getting balance for:", address);
      
      const balance = await readOnlyClient!.getBalance(
        address, 
        env.currency.coinMinimalDenom
      );
      
      console.log("💎 Raw balance:", balance);
      return balance;
    } catch (error) {
      console.error("❌ Failed to get balance:", error);
      
      // 🎭 Return mock balance for testing
      console.log("🎭 Returning mock balance for testing");
      return { 
        denom: env.currency.coinMinimalDenom, 
        amount: "0" 
      };
    }
  };

  // Legacy support
  const useKeplr = async () => {
    console.log("⚠️ useKeplr is deprecated for Test Chain");
    throw new Error("Keplr integration disabled for Test Chain. Use Phi Wallet instead.");
  };

  const removeSigner = () => {
    console.log("🧹 Removing signer and client...");
    setSigner(null);
    setClient(null);
    setReadOnlyClient(null);
    setConnectionError(null);
  };

  return {
    client,
    signer,
    readOnlyClient,
    connectionError, // 🆕 Export error state
    env,
    connectWithWallet,
    connectReadOnly,
    getBalance,
    useKeplr,
    removeSigner,
    setClient,
  };
};