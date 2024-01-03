import * as zkos from 'zkos-wasm';

import {
  commitBurnTransaction,
  commitDarkQuisquisTransaction,
  queryUtxoForAddress,
  queryUtxoOutput,
} from '../api/zkosApi';
import { delay } from '../utils';

export const burnTransaction = async ({
  burnAmount,
  signature,
  fromAddress,
  toAddress,
  twilightAddress,
}: {
  signature: string;
  twilightAddress: string;
  fromAddress: string;
  toAddress: string;
  burnAmount: number;
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

  const darkTxSingleJson = zkos.darkTransactionSingle(
    signature,
    coinTypeInput,
    toAddress,
    BigInt(burnAmount),
    false,
    BigInt(0),
  );

  //   const darkTxSingleJson = await createDarkTransaction({
  //     amount: burnAmount,
  //     receiver: toAddress,
  //     sender: coinTypeInput,
  //     senderUpdatedBalance: 0,
  //     signature,
  //     type: 'address',
  //   });

  // eslint-disable-next-line camelcase, @typescript-eslint/naming-convention
  const { tx: darkTxSingle, encrypt_scalar_hex } = JSON.parse(darkTxSingleJson);

  console.log('darkTxSingle', darkTxSingle);
  console.log('encrypt_scalar_hex', encrypt_scalar_hex);

  const darkTxResponse = await commitDarkQuisquisTransaction(darkTxSingle);
  console.log('darkTxResponse', darkTxResponse);
  const { txHash } = JSON.parse(darkTxResponse.result);

  console.log('darkTxHash', txHash);

  await delay(10000);

  const updatedAddresses = zkos.getUpdatedAddressesFromTransaction(
    signature,
    darkTxSingle,
  );

  const updatedReceiverAddress = JSON.parse(updatedAddresses)[1];
  const utxos1 = await queryUtxoForAddress(updatedReceiverAddress);

  const utxoString1 = JSON.stringify(utxos1.result[0]);

  const utxoHex1 = zkos.getUtxoHexFromJson(utxoString1);

  const output1 = await queryUtxoOutput(utxoHex1);

  const outputString1 = JSON.stringify(output1.result);

  const coinTypeInput1 = zkos.createInputFromOutput(
    outputString1,
    utxoString1,
    BigInt(0),
  );

  const burnTx = zkos.createBurnMessageTransaction(
    coinTypeInput1,
    BigInt(burnAmount),
    encrypt_scalar_hex,
    signature,
    toAddress,
  );

  //   const burnTx = await createBurnTransaction({
  //     coinTypeInput: coinTypeInput1,
  //     burnAmount,
  //     encrypt_scalar_hex,
  //     signature,
  //     toAddress,
  //   });

  console.log('burnTxHash', burnTx);

  const burnTxResponse = await commitBurnTransaction(burnTx, twilightAddress);

  console.log('burnTxResponse', burnTxResponse);

  await delay(5000);

  const tradingAccountHex = zkos.createTradingAccountHexFromOutput(
    outputString1,
    toAddress,
  );

  // eslint-disable-next-line camelcase
  return { tradingAccountHex, encryptScalarHex: encrypt_scalar_hex };
};
