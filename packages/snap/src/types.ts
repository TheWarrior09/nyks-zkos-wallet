export type NewFundingAccount = {
  amount: number;
};

export type DarkQuisquisTxParams = {
  fromAddress: string;
  toAddress: string;
  toAddressType: 'address';
  amountAvailable: number;
  amountSend: number;
};

export type TradingAccountData = {
  tradingAddress: string;
  value: string;
  utxo: string;
  txId: string;
};
