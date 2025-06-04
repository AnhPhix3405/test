import { useClient } from "../hooks/useClient";
import { useWalletContext } from "../def-hooks/walletContext";

export default function () {
  const client = useClient();
  const { setActiveWallet } = useWalletContext();

  const connectToKeplr = async (onSuccessCb: () => void, onErrorCb: () => void) => {
    try {
      setActiveWallet();
      onSuccessCb();
    } catch (e) {
      console.error(e);
      onErrorCb();
    }
  };

  const isKeplrAvailable = !!window.keplr;

  const getOfflineSigner = (chainId: string) => window.keplr.getOfflineSigner(chainId);

  const getKeplrAccParams = async (chainId: string) => await window.keplr.getKey(chainId);

  const listenToAccChange = (cb: EventListener) => {
    client.on("signer-changed", cb);
  };

  return {
    connectToKeplr,
    isKeplrAvailable,
    getOfflineSigner,
    getKeplrAccParams,
    listenToAccChange,
  };
}
