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

  const coinTypeInput = zkos.createInputFromOutput(
    outputString,
    utxoString,
    BigInt(0),
  );

  let receiver: string;

  if (toAddressType === 'output') {
    const receiverOutput = await queryUtxoOutput(toAddress);

    const receiverOutputString = JSON.stringify(receiverOutput.result);

    const receiverUtxo = zkos.createUtxoFromHex(toAddress);

    receiver = zkos.createInputFromOutput(
      receiverOutputString,
      receiverUtxo,
      BigInt(0),
    );
  } else {
    receiver = toAddress;
  }

  const darkTxSingleJson = zkos.darkTransactionSingle(
    signature,
    coinTypeInput,
    receiver,
    BigInt(amountSend),
    toAddressType === 'output',
    BigInt(amountAvailable - amountSend),
  );

  const { tx: darkTxSingle } = JSON.parse(darkTxSingleJson);
  console.log('darkTxSingle', darkTxSingle);

  const txResponse = await commitDarkQuisquisTransaction(darkTxSingle);
  console.log('txResponse', txResponse);
  const { txHash } = JSON.parse(txResponse.result);

  return txHash;
};
