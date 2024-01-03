import * as zkos from 'zkos-wasm';

import {
  queryUtxoForAddress,
  queryUtxoFromDB,
  queryUtxoOutput,
} from '../api/zkosApi';

const getAddressUtxoDetails = async (address: string) => {
  const utxoResponse = await queryUtxoForAddress(address);
  const utxo = JSON.stringify(utxoResponse.result[0]);
  const utxoHex = zkos.getUtxoHexFromJson(utxo);

  return { utxoJson: utxo, utxoHex };
};

const getAddressOutputDetails = async (address: string) => {
  const utxoDetails = await getAddressUtxoDetails(address);
  const outputResponse = await queryUtxoOutput(utxoDetails.utxoHex);
  const output = JSON.stringify(outputResponse.result);

  return { output, ...utxoDetails };
};

const getAddressDetails = async (signature: string, address: string) => {
  const addressOutputDetails = await getAddressOutputDetails(address);
  const value = zkos.decryptOutputValue(signature, addressOutputDetails.output);

  return { value, ...addressOutputDetails };
};

const fetchUserAddresses = async (signature: string) => {
  const utxos = await queryUtxoFromDB();
  const addresses = zkos.coinAddressMonitoring(
    utxos.result.result ?? JSON.stringify(''),
    signature,
  );
  return JSON.parse(addresses) as string[];
};

export { getAddressDetails, fetchUserAddresses };
