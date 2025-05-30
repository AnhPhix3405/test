import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { BLOCKCHAIN_CONFIG } from "./config/blockchain";

export async function createNewWallet() {
  // Tạo wallet với prefix của blockchain riêng
  const wallet = await DirectSecp256k1HdWallet.generate(12, {
    prefix: BLOCKCHAIN_CONFIG.addressPrefix, // "myphi" thay vì "cosmos"
  });
  
  const accounts = await wallet.getAccounts();
  return {
    mnemonic: wallet.mnemonic,
    address: accounts[0].address,
    wallet, // Return wallet object để sử dụng tiếp
  };
}

export async function importWalletFromMnemonic(mnemonic: string) {
  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: BLOCKCHAIN_CONFIG.addressPrefix,
    });
    
    const accounts = await wallet.getAccounts();
    return {
      mnemonic: wallet.mnemonic,
      address: accounts[0].address,
      wallet,
    };
  } catch (error) {
    throw new Error("Invalid mnemonic phrase");
  }
}

export function validateMnemonic(mnemonic: string): boolean {
  const words = mnemonic.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
}