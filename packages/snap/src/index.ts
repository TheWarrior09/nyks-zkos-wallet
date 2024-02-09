import { rpcErrors, providerErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { panel, text, heading, DialogType, divider } from '@metamask/snaps-sdk';

import {
  generateRandomTradingAddress,
  handleGetUpdatedTradingAccounts,
} from './accounts/tradingAccounts';
import { darkTransaction } from './transactions/darkTx';
import { quisquisTransaction } from './transactions/quisquisTx';
import type { DarkQuisquisTxParams, NewFundingAccount } from './types';
import { clearState, getEntropy, getState, setState } from './utils';
import { generateNewFundingAccount } from './zkosWasm';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'generateNewFundingAccount': {
      const { amount } = request.params as NewFundingAccount;
      const entropy = await getEntropy();
      const newFundingAccount = generateNewFundingAccount(entropy, amount);

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([
            heading('New trading account generated'),

            divider(),

            text('**New zkos account:**'),
            text(newFundingAccount.zkAccount),

            text('**New scalar:**'),
            text(newFundingAccount.rScalar),

            text('**Amount:**'),
            text(amount.toString()),
          ]),
        },
      });

      return newFundingAccount;
    }

    case 'getTradingAccounts': {
      const persistedData = await getState();

      return persistedData.addresses;
    }

    case 'getUpdatedTradingAccounts': {
      const entropy = await getEntropy();
      const updatedAccounts = await handleGetUpdatedTradingAccounts(entropy);

      await clearState();

      await setState({
        addresses: updatedAccounts,
      });

      return updatedAccounts;
    }

    case 'generateRandomTradingAddress': {
      const entropy = await getEntropy();
      const tradingAddress = generateRandomTradingAddress(entropy);

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([
            heading('New trading address generated'),

            divider(),

            text('**Trading address:**'),
            text(tradingAddress),
          ]),
        },
      });
      return tradingAddress;
    }

    case 'sendDarkTx': {
      const {
        amountAvailable,
        amountSend,
        fromAddress,
        toAddress,
        toAddressType,
      } = request.params as DarkQuisquisTxParams;

      const signatureRequestContent = panel([
        heading('Review and sign the dark transaction'),
        text('Before signing the dark transaction you need to review it.'),

        divider(),

        text('**From address:**'),
        text(fromAddress),

        text('**To address:**'),
        text(toAddress),

        text('**Amount available:**'),
        text(String(amountAvailable)),

        text('**Amount send:**'),
        text(String(amountSend)),
      ]);

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: signatureRequestContent,
        },
      });

      if (!approved) {
        throw providerErrors.userRejectedRequest();
      }

      const privateKey = await getEntropy();

      try {
        const response = await darkTransaction({
          signature: privateKey,
          fromAddress,
          toAddress,
          toAddressType,
          amountAvailable,
          amountSend,
        });

        return response;
      } catch (error) {
        console.error('error in dark transaction', error);
        return 'error in dark transaction';
      }
    }

    case 'sendQuisquisTx': {
      const {
        amountAvailable,
        amountSend,
        fromAddress,
        toAddress,
        toAddressType,
      } = request.params as DarkQuisquisTxParams;

      const signatureRequestContent = panel([
        heading('Review and sign the quisquis transaction'),
        text('Before signing the quisquis transaction you need to review it.'),

        divider(),

        text('**From address:**'),
        text(fromAddress),

        text('**To address:**'),
        text(toAddress),

        text('**Amount available:**'),
        text(String(amountAvailable)),

        text('**Amount send:**'),
        text(String(amountSend)),
      ]);

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: signatureRequestContent,
        },
      });

      if (!approved) {
        throw providerErrors.userRejectedRequest();
      }

      const privateKey = await getEntropy();

      try {
        const response = await quisquisTransaction({
          signature: privateKey,
          fromAddress,
          toAddress,
          toAddressType,
          amountAvailable,
          amountSend,
        });

        return response;
      } catch (error) {
        console.error('error in quisquis transaction', error);
        return 'error in quisquis transaction';
      }
    }

    default:
      throw rpcErrors.methodNotFound({
        data: { method: request.method },
      });
  }
};
