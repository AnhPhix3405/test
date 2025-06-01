import { useState, useEffect } from "react";
import { useWalletContext } from "../def-hooks/walletContext";
import { usePhiWallet } from "../hooks/usePhiWallet";
import { IgntButton, IgntModal, IgntCard } from "@ignt/react-library";
import { BLOCKCHAIN_CONFIG } from "../config/blockchain";
import TransactionHistory from "../components/TransactionHistory";

export default function WalletView() {
  const { activeWallet } = useWalletContext();
  const phiWallet = usePhiWallet();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 🆕 Add connection status

  // 🆕 Auto-connect phiWallet when activeWallet is available
  useEffect(() => {
    const connectPhiWallet = async () => {
      if (activeWallet && !phiWallet.isConnected) {
        console.log("🔄 Auto-connecting phiWallet in WalletView...");
        setConnectionStatus('connecting');
        try {
          await phiWallet.importWallet(activeWallet.mnemonic);
          console.log("✅ PhiWallet connected successfully in WalletView!");
          setConnectionStatus('connected');
          
          // Load balance after successful connection
          await loadBalance();
        } catch (error) {
          console.error("❌ Failed to connect phiWallet in WalletView:", error);
          setConnectionStatus('failed');
        }
      } else if (activeWallet && phiWallet.isConnected) {
        setConnectionStatus('connected');
        loadBalance();
      }
    };

    connectPhiWallet();
  }, [activeWallet, phiWallet.isConnected]);

  const loadBalance = async () => {
    if (!activeWallet?.accounts[0]?.address) return;
    if (!phiWallet.isConnected || !phiWallet.client) {
      console.warn("⚠️ PhiWallet not connected, skipping balance load");
      return;
    }
    
    setLoading(true);
    try {
      console.log("💰 Loading balance for:", activeWallet.accounts[0].address);
      const balanceData = await phiWallet.getBalance(activeWallet.accounts[0].address);
      setBalance(balanceData);
      console.log("✅ Balance loaded:", balanceData);
    } catch (error) {
      console.error("❌ Failed to load balance:", error);
      setBalance({ 
        amount: "0",
        denom: BLOCKCHAIN_CONFIG.currency.coinMinimalDenom, 
        readable: `0 ${BLOCKCHAIN_CONFIG.currency.coinDenom}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Add faucet request function
  const handleRequestFaucet = async () => {
    if (!activeWallet?.accounts[0]?.address) return;
    
    setLoading(true);
    try {
      console.log("🚰 Requesting faucet for:", activeWallet.accounts[0].address);
      await phiWallet.requestFaucet(activeWallet.accounts[0].address);
      console.log("✅ Faucet request successful");
      
      // Wait a bit then refresh balance
      setTimeout(() => {
        loadBalance();
      }, 3000);
    } catch (error) {
      console.error("❌ Faucet request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!activeWallet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No Wallet Connected</h1>
          <p className="text-gray-600 mb-8">Please connect your Phi Wallet to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wallet Information</h1>
        
        {/* 🆕 Connection Status Indicator */}
        <div className="mb-4">
          {connectionStatus === 'connecting' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                <span className="text-yellow-700">Connecting to blockchain...</span>
              </div>
            </div>
          )}
          {connectionStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-red-700">❌ Failed to connect to blockchain</span>
                <IgntButton 
                  type="secondary" 
                  onClick={() => window.location.reload()}
                  className="text-sm"
                >
                  Retry
                </IgntButton>
              </div>
            </div>
          )}
          {connectionStatus === 'connected' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <span className="text-green-700">✅ Connected to {BLOCKCHAIN_CONFIG.chainName}</span>
            </div>
          )}
        </div>
        
        {/* Wallet Overview */}
        <IgntCard className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  Φ
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{activeWallet.name || "Phi Wallet"}</h2>
                  <p className="text-gray-500">Test Chain Wallet</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Network</div>
                <div className="font-medium">{BLOCKCHAIN_CONFIG.chainName}</div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Wallet Address</div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <code className="text-sm break-all">{activeWallet.accounts[0]?.address}</code>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Balance</div>
              <div className="flex items-center justify-between">
                <div>
                  {loading ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : balance ? (
                    <div className="text-2xl font-bold">{balance.readable}</div>
                  ) : (
                    <div className="text-gray-400">Unable to load balance</div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {/* 🆕 Add Faucet button */}
                  <IgntButton 
                    type="primary" 
                    onClick={handleRequestFaucet} 
                    disabled={loading || connectionStatus !== 'connected'}
                    className="text-sm"
                  >
                    🚰 Faucet
                  </IgntButton>
                  <IgntButton 
                    type="secondary" 
                    onClick={loadBalance} 
                    disabled={loading || connectionStatus !== 'connected'}
                  >
                    Refresh
                  </IgntButton>
                </div>
              </div>
            </div>

            {/* 🆕 Debug Info (removable in production) */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
              <div><strong>Debug Info:</strong></div>
              <div>Connection: {connectionStatus}</div>
              <div>PhiWallet Connected: {phiWallet.isConnected ? 'Yes' : 'No'}</div>
              <div>Client Available: {phiWallet.client ? 'Yes' : 'No'}</div>
              <div>Address: {activeWallet.accounts[0]?.address}</div>
            </div>
          </div>
        </IgntCard>

        {/* Security Information */}
        <IgntCard className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Security Information</h3>
            
            {activeWallet.mnemonic && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Recovery Phrase</div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-yellow-700">
                      ⚠️ Keep your recovery phrase secure and private
                    </div>
                    <IgntButton
                      type="secondary"
                      onClick={() => setShowMnemonic(true)}
                      className="text-sm"
                    >
                      View Recovery Phrase
                    </IgntButton>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Wallet Type:</span>
                <span className="ml-2 font-medium">HD Wallet</span>
              </div>
              <div>
                <span className="text-gray-500">Derivation Path:</span>
                <span className="ml-2 font-medium">m/44&apos;/118&apos;/0&apos;/0/0</span>
              </div>
            </div>
          </div>
        </IgntCard>

        {/* Technical Details */}
        <IgntCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Chain ID:</span>
                <span className="font-medium">{BLOCKCHAIN_CONFIG.chainId}</span>
              </div>
              <div>
                <span className="text-gray-500 block">RPC Endpoint:</span>
                <span className="font-medium break-all">{BLOCKCHAIN_CONFIG.rpcEndpoint}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Currency:</span>
                <span className="font-medium">{BLOCKCHAIN_CONFIG.currency.coinDenom}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Decimals:</span>
                <span className="font-medium">{BLOCKCHAIN_CONFIG.currency.coinDecimals}</span>
              </div>
            </div>
          </div>
        </IgntCard>
        {/* 🆕 Transaction History */}
        <TransactionHistory />
      </div>

      {/* Recovery Phrase Modal */}
      <IgntModal
        visible={showMnemonic}
        closeIcon={true}
        cancelButton={false}
        submitButton={false}
        close={() => setShowMnemonic(false)}
        submit={() => null}
        header="Recovery Phrase"
        body={
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">🚨 Security Warning</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Never share your recovery phrase with anyone</li>
                <li>• Store it securely offline</li>
                <li>• Anyone with this phrase can access your wallet</li>
                <li>• Make sure you&apos;re in a private location</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                {activeWallet.mnemonic?.split(' ').map((word, index) => (
                  <div key={index} className="bg-white p-2 rounded border text-center">
                    <span className="text-gray-400 text-xs">{index + 1}.</span>
                    <div className="font-medium">{word}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <IgntButton
                type="primary"
                onClick={() => setShowMnemonic(false)}
              >
                I&apos;ve Saved It Securely
              </IgntButton>
            </div>
          </div>
        }
        footer=""
      />
    </div>
  );
}