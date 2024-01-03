import { ZKOS_API_ENDPOINT } from '../../constants';

const fetchFromZkos = async (body: string) => {
  const response = await fetch(ZKOS_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Bad response from zkos server');
  }

  const data = await response.json();
  return data;
};

const queryUtxoForAddress = async (zkosAddress: string) => {
  const message = JSON.stringify({
    jsonrpc: '2.0',
    method: 'getUtxos',
    params: [zkosAddress],
    id: 1,
  });

  return fetchFromZkos(message);
};

const queryUtxoOutput = async (utxo: string) => {
  const message = JSON.stringify({
    jsonrpc: '2.0',
    method: 'getOutput',
    params: [utxo],
    id: 1,
  });

  return fetchFromZkos(message);
};

const queryUtxoFromDB = async (
  startBlock = 0,
  endBlock = -1,
  limit = 10000,
) => {
  const message = JSON.stringify({
    jsonrpc: '2.0',
    method: 'getUtxosFromDB',
    params: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      start_block: startBlock,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      end_block: endBlock,
      limit,
      pagination: 0,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      io_type: 'Coin',
    },
    id: 1,
  });

  return fetchFromZkos(message);
};

const commitDarkQuisquisTransaction = async (darkTxHex: string) => {
  const message = JSON.stringify({
    jsonrpc: '2.0',
    method: 'txCommit',
    params: [darkTxHex],
    id: 1,
  });

  return fetchFromZkos(message);
};

const commitBurnTransaction = async (
  darkTxHex: string,
  twilightAddress: string,
) => {
  const message = JSON.stringify({
    jsonrpc: '2.0',
    method: 'txCommit',
    params: [darkTxHex, twilightAddress],
    id: 1,
  });

  return fetchFromZkos(message);
};

export {
  queryUtxoForAddress,
  queryUtxoOutput,
  queryUtxoFromDB,
  commitDarkQuisquisTransaction,
  commitBurnTransaction,
};
