import * as zkos from 'zkos-wasm';

const generateNewFundingAccount = (signature: string, amount: number) => {
  const publicKey = zkos.generatePublicKeyFromSignature(signature);
  return zkos.generateChainFundingTradingAccount(publicKey, amount);
};

export { generateNewFundingAccount };
