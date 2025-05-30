import { createContext, ReactNode, useContext, useState } from "react";
import { useClient } from "../hooks/useClient";
import { usePhiWallet } from "../hooks/usePhiWallet";
import CryptoJS from "crypto-js";
import type { Wallet, Nullable, EncodedWallet } from "../utils/interfaces";
import { BLOCKCHAIN_CONFIG } from "../config/blockchain";

interface Props {
  children?: ReactNode;
}

const initState = {
  wallets:
    (JSON.parse(window.localStorage.getItem("wallets") ?? "null") as Array<EncodedWallet>) ||
    ([] as Array<EncodedWallet>),
  activeWallet: null as Nullable<Wallet>,
  activeClient: null as Nullable<ReturnType<typeof useClient>>,
};

type WalletDispatch = {
  // Legacy Keplr support
  connectWithKeplr: () => Promise<void>;
  
  // New Phi Wallet methods
  connectWithPhiWallet: () => Promise<void>;
  importPhiWallet: (mnemonic: string) => Promise<void>;
  
  // Common methods
  signOut: () => void;
};

const WalletContext = createContext(initState);
const WalletDispatchContext = createContext({} as WalletDispatch);

export const useWalletContext = () => useContext(WalletContext);
export const useDispatchWalletContext = () => useContext(WalletDispatchContext);

export default function WalletProvider({ children }: Props) {
  const [wallets, setWallets] = useState(initState.wallets);
  const [activeWallet, setActiveWallet] = useState(initState.activeWallet);
  const [activeClient, setActiveClient] = useState(initState.activeClient);
  
  const client = useClient();
  const phiWallet = usePhiWallet();

  // 🆕 NEW: Connect với Phi Wallet (Create new)
  const connectWithPhiWallet = async () => {
    try {
      console.log("🔗 Creating new Phi wallet...");
      
      const walletData = await phiWallet.createWallet();
      
      const wallet: Wallet = {
        name: BLOCKCHAIN_CONFIG.walletName, // "Phi Wallet"
        mnemonic: walletData.mnemonic,
        HDpath: null,
        password: null,
        prefix: BLOCKCHAIN_CONFIG.addressPrefix, // "phi"
        pathIncrement: null,
        accounts: [{ address: walletData.address, pathIncrement: null }],
      };

      setActiveWallet(wallet);
      setActiveClient(client);
      window.localStorage.setItem("lastWallet", wallet.name);

      // Save wallet to localStorage
      const newWalletEntry = {
        name: `${wallet.name} (${new Date().toLocaleDateString()})`,
        wallet: JSON.stringify(wallet),
      };

      const updatedWallets = [...wallets, newWalletEntry];
      setWallets(updatedWallets);
      window.localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      
      console.log("✅ Phi wallet connected:", walletData.address);
      console.log("🔑 Mnemonic saved for wallet:", wallet.name);
    } catch (e) {
      console.error("❌ Phi wallet connection failed:", e);
      throw e;
    }
  };

  // 🆕 NEW: Import Phi Wallet từ mnemonic
  const importPhiWallet = async (mnemonic: string) => {
    try {
      console.log("📥 Importing Phi wallet...");
      
      const walletData = await phiWallet.importWallet(mnemonic);
      
      const wallet: Wallet = {
        name: `${BLOCKCHAIN_CONFIG.walletName} (Imported)`,
        mnemonic: walletData.mnemonic,
        HDpath: null,
        password: null,
        prefix: BLOCKCHAIN_CONFIG.addressPrefix,
        pathIncrement: null,
        accounts: [{ address: walletData.address, pathIncrement: null }],
      };

      setActiveWallet(wallet);
      setActiveClient(client);
      window.localStorage.setItem("lastWallet", wallet.name);

      // Save imported wallet
      const newWalletEntry = {
        name: `${wallet.name} (${new Date().toLocaleDateString()})`,
        wallet: JSON.stringify(wallet),
      };

      const updatedWallets = [...wallets, newWalletEntry];
      setWallets(updatedWallets);
      window.localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      
      console.log("✅ Phi wallet imported:", walletData.address);
    } catch (e) {
      console.error("❌ Phi wallet import failed:", e);
      throw e;
    }
  };

  // 🔄 UPDATED: Legacy Keplr support (deprecated)
  const connectWithKeplr = async () => {
    try {
      console.log("⚠️ Keplr integration is deprecated for Test Chain");
      console.log("💡 Please use Phi Wallet instead");
      
      // Still allow Keplr for compatibility, but warn user
      console.log("🔗 Starting legacy Keplr connection...");

      const wallet: Wallet = {
        name: "Keplr Integration (Legacy)",
        mnemonic: null,
        HDpath: null,
        password: null,
        prefix: BLOCKCHAIN_CONFIG.addressPrefix,
        pathIncrement: null,
        accounts: [],
      };

      // Check Keplr availability
      if (!(window as any).keplr) {
        throw new Error("Keplr extension not found. Please use Phi Wallet instead.");
      }

      console.log("🔌 Calling client.useKeplr()...");
      await client.useKeplr();

      console.log("📋 Getting accounts...");
      const [account] = await client.signer!.getAccounts();
      wallet.accounts.push({ address: account.address, pathIncrement: null });

      console.log("✅ Keplr connected (legacy mode):", account.address);

      setActiveWallet(wallet);
      setActiveClient(client);
      window.localStorage.setItem("lastWallet", wallet.name);

      // Save wallet
      const newWalletEntry = {
        name: wallet.name,
        wallet: JSON.stringify(wallet),
      };

      const updatedWallets = [...wallets, newWalletEntry];
      setWallets(updatedWallets);
      window.localStorage.setItem("wallets", JSON.stringify(updatedWallets));

    } catch (e) {
      console.error("❌ Keplr connection failed:", e);
      throw e;
    }
  };

  // 🧹 UPDATED: Enhanced signOut
  const signOut = () => {
    console.log("🚪 Signing out from Test Chain...");
    
    // Disconnect from blockchain
    if (client && client.removeSigner) {
      client.removeSigner();
    }

    // Disconnect from Phi Wallet
    if (phiWallet && phiWallet.disconnect) {
      phiWallet.disconnect();
    }
    
    // Clear state
    setActiveClient(null);
    setActiveWallet(null);
    window.localStorage.removeItem("lastWallet");
    
    console.log("✅ Successfully signed out");
  };

  return (
    <WalletContext.Provider value={{ wallets, activeWallet, activeClient }}>
      <WalletDispatchContext.Provider value={{ 
        // Legacy
        connectWithKeplr,
        
        // New Phi Wallet methods
        connectWithPhiWallet,
        importPhiWallet,
        
        // Common
        signOut 
      }}>
        {children}
      </WalletDispatchContext.Provider>
    </WalletContext.Provider>
  );
}