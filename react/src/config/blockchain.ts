export const BLOCKCHAIN_CONFIG = {
  chainId: "test", // Default Ignite chain ID
  chainName: "Test Chain",
  rpcEndpoint: "http://localhost:26657",
  restEndpoint: "http://localhost:1317",
  addressPrefix: "cosmos", // Default Ignite prefix
  currency: {
    coinDenom: "STAKE", // Default Ignite token
    coinMinimalDenom: "stake", // Default Ignite token
    coinDecimals: 6,
  },
  gasPrices: {
    stake: 0.025, // Use stake as gas
  },
  walletName: "Test Wallet",
  explorerUrl: "http://localhost:1317",

  // 🆕 Add faucet endpoint
  faucetEndpoint: "http://localhost:4500",
  faucetAmount: "1000000", // 1 STAKE in ustake
};