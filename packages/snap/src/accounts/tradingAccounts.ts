import * as zkos from 'zkos-wasm';

import type { TradingAccountData } from '../types';
import { fetchUserAddresses, getAddressDetails } from './addressDetails';

const handleGetUpdatedTradingAccounts = async (signature: string) => {
  const addresses = await fetchUserAddresses(signature);
  const tradingAccountData: Promise<TradingAccountData>[] = addresses.map(
    async (item: string) => {
      const addressDetails = await getAddressDetails(signature, item);

      const utxo = zkos.createUtxoFromHex(addressDetails.utxoHex);
      const txId = zkos.txIdToHexString(utxo);

      return {
        tradingAddress: item,
        value: addressDetails.value.toString(),
        utxo: addressDetails.utxoHex,
        txId,
      };
    },
  );

  const accounts = await Promise.all(tradingAccountData);
  return accounts;
};

const generateRandomTradingAddress = (signature: string) => {
  const publicKey = zkos.generatePublicKeyFromSignature(signature);
  return zkos.generateRandomAddress(publicKey);
};

export { handleGetUpdatedTradingAccounts, generateRandomTradingAddress };
