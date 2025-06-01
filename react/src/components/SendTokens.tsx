import React, { useState, useEffect } from 'react';
import { usePhiWallet } from '../hooks/usePhiWallet';
import { useWalletContext } from '../def-hooks/walletContext';
import { TransactionSigning } from './TransactionSigning';
import "../styles/advanced-feature.css"

interface SendTokensProps {
  currentAddress: string;
  onTransactionComplete?: (txHash: string) => void;
}

const SendTokens: React.FC<SendTokensProps> = ({ 
  currentAddress, 
  onTransactionComplete 
}) => {
  const phiWallet = usePhiWallet();
  const { activeWallet } = useWalletContext();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State for transaction signing
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [isSigningLoading, setIsSigningLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // 🆕 Ensure connection on component mount and when activeWallet changes
  useEffect(() => {
    const ensureConnection = async () => {
      if (!activeWallet) {
        setConnectionStatus('no-wallet');
        return;
      }

      if (!phiWallet.isConnected || !phiWallet.client) {
        console.log("🔄 SendTokens: PhiWallet not connected, connecting...");
        setConnectionStatus('connecting');
        try {
          await phiWallet.importWallet(activeWallet.mnemonic);
          console.log("✅ SendTokens: PhiWallet connected successfully!");
          setConnectionStatus('connected');
        } catch (error) {
          console.error("❌ SendTokens: Failed to connect phiWallet:", error);
          setConnectionStatus('failed');
          setError("Failed to connect to blockchain. Please refresh and try again.");
        }
      } else {
        setConnectionStatus('connected');
      }
    };

    ensureConnection();
  }, [activeWallet, phiWallet.isConnected, phiWallet.client]);

  // 🆕 Enhanced connection check
  const isConnected = !!(
    activeWallet && 
    phiWallet.isConnected && 
    phiWallet.client &&
    connectionStatus === 'connected'
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // 🆕 Double-check connection before proceeding
      if (!isConnected) {
        throw new Error("Wallet not connected to blockchain. Please wait for connection or refresh the page.");
      }

      // 🆕 Extra safety check
      if (!phiWallet.client) {
        console.error("❌ Client not available even though isConnected=true");
        console.error("Debug info:", {
          activeWallet: !!activeWallet,
          phiWalletConnected: phiWallet.isConnected,
          phiWalletClient: !!phiWallet.client,
          connectionStatus
        });
        throw new Error("Blockchain client not available. Please refresh and try again.");
      }

      setIsLoading(true);

      // Validate inputs
      if (!recipient.trim()) {
        throw new Error('Recipient address is required');
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Use activeWallet address
      const senderAddress = activeWallet?.accounts[0]?.address || currentAddress;
      
      console.log("🔍 About to check balance for:", senderAddress);
      console.log("🔍 Client status:", {
        client: !!phiWallet.client,
        isConnected: phiWallet.isConnected,
        connectionStatus
      });
      
      // Check balance before sending
      const balance = await phiWallet.getBalance(senderAddress);
      const sendAmount = parseFloat(amount);
      const availableAmount = parseFloat(balance.amount) / Math.pow(10, phiWallet.config.currency.coinDecimals);

      if (sendAmount > availableAmount) {
        throw new Error(`Insufficient balance. Available: ${availableAmount.toFixed(6)} ${phiWallet.config.currency.coinDenom}`);
      }

      // Show transaction signing modal
      setPendingTransaction({
        recipient: recipient.trim(),
        amount: amount,
        memo: memo.trim() || undefined,
      });
      setShowSigningModal(true);
      
    } catch (err: any) {
      console.error("❌ HandleSend error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = async () => {
    if (!pendingTransaction) return;

    setIsSigningLoading(true);
    try {
      // 🆕 Re-check connection before sending
      if (!phiWallet.client) {
        throw new Error("Lost connection to blockchain. Please refresh and try again.");
      }

      const result = await phiWallet.sendTokens(
        pendingTransaction.recipient,
        pendingTransaction.amount,
        pendingTransaction.memo
      );

      setSuccess(`Transaction sent successfully! Hash: ${result.transactionHash}`);
      onTransactionComplete?.(result.transactionHash);

      // Reset form
      setRecipient('');
      setAmount('');
      setMemo('');
      setShowSigningModal(false);
      setPendingTransaction(null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSigningLoading(false);
    }
  };

  const handleCancelTransaction = () => {
    setShowSigningModal(false);
    setPendingTransaction(null);
    setIsSigningLoading(false);
  };

  // Show loading while connecting
  if (connectionStatus === 'connecting') {
    return (
      <div className="send-tokens-container">
        <div className="connection-prompt">
          <h3>🔄 Connecting to Blockchain...</h3>
          <p>Please wait while we establish connection.</p>
          <div className="loading-spinner">⏳</div>
        </div>
      </div>
    );
  }

  // Show connection prompt if no wallet
  if (!activeWallet || connectionStatus === 'no-wallet') {
    return (
      <div className="send-tokens-container">
        <div className="connection-prompt">
          <h3>🔒 No Wallet Found</h3>
          <p>Please create or import a wallet first.</p>
        </div>
      </div>
    );
  }

  // Show blockchain connection error
  if (connectionStatus === 'failed' || !isConnected) {
    return (
      <div className="send-tokens-container">
        <div className="connection-prompt">
          <h3>⚠️ Blockchain Connection Failed</h3>
          <p>Unable to connect to the blockchain network.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="connect-button"
          >
            🔄 Refresh Page
          </button>
          {error && (
            <div className="error-message">❌ {error}</div>
          )}
          
          {/* 🆕 Debug info */}
          <div className="debug-info" style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <strong>Debug Info:</strong><br/>
            activeWallet: {activeWallet ? 'Yes' : 'No'}<br/>
            phiWallet.isConnected: {phiWallet.isConnected ? 'Yes' : 'No'}<br/>
            phiWallet.client: {phiWallet.client ? 'Yes' : 'No'}<br/>
            connectionStatus: {connectionStatus}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="send-tokens-container">
      <h3>💸 Send Tokens</h3>
      
      {/* Connection Status */}
      <div className="connection-status" style={{ 
        padding: '8px', 
        backgroundColor: '#d4edda', 
        border: '1px solid #c3e6cb',
        borderRadius: '4px',
        marginBottom: '16px',
        fontSize: '14px'
      }}>
        ✅ Connected: {activeWallet?.accounts[0]?.address.slice(0, 12)}...{activeWallet?.accounts[0]?.address.slice(-8)}
      </div>

      <form onSubmit={handleSend}>
        {/* Your existing form fields */}
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address:</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="cosmos1..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.000001"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="memo">Memo (optional):</label>
          <input
            type="text"
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Transaction memo"
          />
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isConnected}
          className="submit-button"
        >
          {isLoading ? 'Processing...' : '💸 Review Transaction'}
        </button>
      </form>

      {/* Transaction Signing Modal */}
      {showSigningModal && pendingTransaction && (
        <TransactionSigning
          transaction={pendingTransaction}
          onConfirm={handleConfirmTransaction}
          onCancel={handleCancelTransaction}
          isLoading={isSigningLoading}
        />
      )}
    </div>
  );
};

export default SendTokens;