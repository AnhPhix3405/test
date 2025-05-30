import { useState } from "react";
import { useDispatchWalletContext, useWalletContext } from "../def-hooks/walletContext";
import { usePhiWallet } from "../hooks/usePhiWallet";
import { BLOCKCHAIN_CONFIG } from "../config/blockchain";
import {
  IgntButton,
  IgntModal,
  IgntSpinner,
} from "@ignt/react-library";

interface State {
  modalPage: "connect" | "create" | "import" | "creating" | "importing" | "success" | "error";
  showModal: boolean;
  importMnemonic: string;
  newWalletData: { address: string; mnemonic: string } | null;
  errorMessage: string;
  showMnemonic: boolean;
}

export default function PhiWalletConnect() {
  const walletStore = useWalletContext();
  const walletActions = useDispatchWalletContext();
  const phiWallet = usePhiWallet();

  const [state, setState] = useState<State>({
    modalPage: "connect",
    showModal: false,
    importMnemonic: "",
    newWalletData: null,
    errorMessage: "",
    showMnemonic: false,
  });

  const handleCreateWallet = async () => {
    try {
      setState(prev => ({ ...prev, modalPage: "creating" }));
      
      await walletActions.connectWithPhiWallet();
      
      setState(prev => ({ 
        ...prev, 
        modalPage: "success",
        showModal: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        modalPage: "error",
        errorMessage: error.message || "Failed to create wallet"
      }));
    }
  };

  const handleImportWallet = async () => {
    try {
      if (!state.importMnemonic.trim()) {
        setState(prev => ({ 
          ...prev, 
          errorMessage: "Please enter a valid mnemonic phrase" 
        }));
        return;
      }

      setState(prev => ({ ...prev, modalPage: "importing" }));
      
      await walletActions.importPhiWallet(state.importMnemonic.trim());
      
      setState(prev => ({ 
        ...prev, 
        modalPage: "success",
        showModal: false,
        importMnemonic: ""
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        modalPage: "error",
        errorMessage: error.message || "Failed to import wallet"
      }));
    }
  };

  const renderModalContent = () => {
    switch (state.modalPage) {
      case "connect":
        return (
          <div className="text-center p-6">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                Φ
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect to {BLOCKCHAIN_CONFIG.chainName}</h2>
              <p className="text-gray-600 mb-6">
                Create a new wallet or import an existing one to get started with Test Chain.
              </p>
            </div>
            <div className="space-y-3">
              <IgntButton
                type="primary"
                onClick={() => setState(prev => ({ ...prev, modalPage: "create" }))}
                className="w-full"
              >
                🆕 Create New Wallet
              </IgntButton>
              <IgntButton
                type="secondary"
                onClick={() => setState(prev => ({ ...prev, modalPage: "import" }))}
                className="w-full"
              >
                📥 Import Existing Wallet
              </IgntButton>
            </div>
          </div>
        );

      case "create":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Wallet</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Security Notice</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Your recovery phrase will be generated automatically</li>
                <li>• Write it down and store it securely offline</li>
                <li>• Never share it with anyone</li>
                <li>• You&apos;ll need it to recover your wallet</li>
              </ul>
            </div>
            <div className="space-y-3">
              <IgntButton
                type="primary"
                onClick={handleCreateWallet}
                className="w-full"
              >
                Create Wallet
              </IgntButton>
              <IgntButton
                type="secondary"
                onClick={() => setState(prev => ({ ...prev, modalPage: "connect" }))}
                className="w-full"
              >
                Back
              </IgntButton>
            </div>
          </div>
        );

      case "import":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Import Wallet</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="mnemonic-input" className="block text-sm font-medium mb-2">
                  Recovery Phrase
                </label>
                <textarea
                  id="mnemonic-input"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Enter your 12 or 24 word recovery phrase..."
                  value={state.importMnemonic}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    importMnemonic: e.target.value,
                    errorMessage: "" // Clear error when typing
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate each word with a space
                </p>
              </div>
              
              {state.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{state.errorMessage}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <IgntButton
                  type="primary"
                  onClick={handleImportWallet}
                  disabled={!state.importMnemonic.trim()}
                  className="w-full"
                >
                  Import Wallet
                </IgntButton>
                <IgntButton
                  type="secondary"
                  onClick={() => setState(prev => ({ 
                    ...prev, 
                    modalPage: "connect",
                    importMnemonic: "",
                    errorMessage: ""
                  }))}
                  className="w-full"
                >
                  Back
                </IgntButton>
              </div>
            </div>
          </div>
        );

      case "creating":
        return (
          <div className="text-center p-6">
            <IgntSpinner size={48} /> 
            <h2 className="text-2xl font-bold mt-4 mb-2">Creating Wallet...</h2>
            <p className="text-gray-600">
              Generating your recovery phrase and connecting to Test Chain...
            </p>
          </div>
        );

      case "importing":
        return (
          <div className="text-center p-6">
            <IgntSpinner size={48} /> 
            <h2 className="text-2xl font-bold mt-4 mb-2">Importing Wallet...</h2>
            <p className="text-gray-600">
              Validating recovery phrase and connecting to Test Chain...
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center p-6">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Connection Failed</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{state.errorMessage}</p>
            </div>
            <div className="space-y-2">
              <IgntButton
                type="primary"
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  modalPage: "connect",
                  errorMessage: ""
                }))}
                className="w-full"
              >
                Try Again
              </IgntButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const wallet = walletStore.activeWallet;

  return (
    <div className="phi-wallet-connect">
      {!wallet ? (
        <IgntButton
          type="primary"
          onClick={() => setState(prev => ({ 
            ...prev, 
            showModal: true, 
            modalPage: "connect" 
          }))}
        >
          Connect Phi Wallet
        </IgntButton>
      ) : (
        <div className="wallet-info bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                Φ
              </div>
              <div>
                <div className="font-medium text-gray-900">{wallet.name}</div>
                <div className="text-sm text-gray-500">
                  {wallet.accounts[0]?.address.slice(0, 12)}...
                  {wallet.accounts[0]?.address.slice(-8)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-xs text-gray-500">Test Chain</div>
                <div className="text-sm font-medium text-green-600">Connected</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <IgntModal
        visible={state.showModal}
        closeIcon={true}
        cancelButton={false}
        submitButton={false}
        className="phi-wallet-modal"
        close={() => setState(prev => ({ 
          ...prev, 
          showModal: false, 
          modalPage: "connect",
          importMnemonic: "",
          errorMessage: ""
        }))}
        submit={() => null}
        header=""
        body={renderModalContent()}
        footer=""
      />
    </div>
  );
}