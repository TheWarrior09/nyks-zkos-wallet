import * as zkos from 'zkos-wasm';

import {
  commitDarkQuisquisTransaction,
  queryUtxoForAddress,
  queryUtxoOutput,
} from '../api/zkosApi';

export const darkTransaction = async ({
  amountSend,
  amountAvailable,
  signature,
  fromAddress,
  toAddress,
  toAddressType,
}: {
  signature: string;
  fromAddress: string;
  toAddress: string;
  toAddressType: 'address' | 'output';
  amountAvailable: number;
  amountSend: number;
}) => {
  const utxos = await queryUtxoForAddress(fromAddress);
  const utxoString = JSON.stringify(utxos.result[0]);
  const utxoHex = zkos.getUtxoHexFromJson(utxoString);

  const output = await queryUtxoOutput(utxoHex);
  const outputString = JSON.stringify(output.result);

  const coinTypeInput = zkos.createInputCoinFromOutput(
    outputString,
    utxoString,
  );

  let receiver: string;

  if (toAddressType === 'output') {
    const receiverOutput = await queryUtxoOutput(toAddress);

    const receiverOutputString = JSON.stringify(receiverOutput.result);

    const receiverUtxo = zkos.createUtxoFromHex(toAddress);

    receiver = zkos.createInputCoinFromOutput(
      receiverOutputString,
      receiverUtxo,
    );
  } else {
    receiver = toAddress;
  }

  const darkTxSingleJson = zkos.privateTransactionSingle(
    signature,
    coinTypeInput,
    receiver,
    BigInt(amountSend),
    toAddressType === 'output',
    BigInt(amountAvailable - amountSend),
    BigInt(1),
  );

  const { tx: darkTxSingle } = JSON.parse(darkTxSingleJson);
  console.log('darkTxSingle', darkTxSingle);

  const txResponse = await commitDarkQuisquisTransaction(darkTxSingle);
  console.log('txResponse', txResponse);
  const { txHash } = JSON.parse(txResponse.result);

  return txHash;
};
