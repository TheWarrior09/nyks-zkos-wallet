import { ManageStateOperation } from '@metamask/snaps-sdk';
import { remove0x } from '@metamask/utils';

import type { TradingAccountData } from './types';

/**
 * Derive entropy which can be used as private key using the `snap_getEntropy`
 * JSON-RPC method. This method returns entropy which is specific to the snap,
 * so other snaps cannot replicate this entropy. This entropy is deterministic,
 * meaning that it will always be the same.
 *
 * The entropy is derived from the snap ID and the salt. The salt is used to
 * generate different entropy for different use cases. For example, in this
 * example we use the salt "Signing key" to generate entropy which can be used
 * as a private key.
 *
 * @param salt - The salt to use for the entropy derivation. Using a different
 * salt will result in completely different entropy being generated.
 * @returns The generated entropy, without the leading "0x".
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy
 */
export async function getEntropy(salt = 'Signing key') {
  const entropy = await snap.request({
    method: 'snap_getEntropy',
    params: {
      version: 1,
      salt,
    },
  });

  return remove0x(entropy);
}

export type State = {
  addresses: TradingAccountData[];
};

/**
 * The default state of the snap. This is returned by the {@link getState}
 * function if the state has not been set yet.
 */
const DEFAULT_STATE = {
  addresses: [],
};

/**
 * Get the current state of the snap. If the snap does not have state, the
 * {@link DEFAULT_STATE} is returned instead.
 *
 * This uses the `snap_manageState` JSON-RPC method to get the state.
 *
 * @returns The current state of the snap.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function getState(): Promise<State> {
  const state = await snap.request({
    method: 'snap_manageState',
    params: {
      operation: ManageStateOperation.GetState,
    },
  });

  return (state as State | null) ?? DEFAULT_STATE;
}

/**
 * Set the state of the snap. This will overwrite the current state.
 *
 * This uses the `snap_manageState` JSON-RPC method to set the state. The state
 * is encrypted with the user's secret recovery phrase and stored in the user's
 * browser.
 *
 * @param newState - The new state of the snap.
 * storage or not. Unencrypted storage does not require the user to unlock
 * MetaMask in order to access it, but it should not be used for sensitive data.
 * Defaults to true.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function setState(newState: State) {
  await snap.request({
    method: 'snap_manageState',

    params: {
      operation: ManageStateOperation.UpdateState,
      newState,
    },
  });
}

/**
 * Clear the state of the snap. This will set the state to the
 * {@link DEFAULT_STATE}.
 *
 * This uses the `snap_manageState` JSON-RPC method to clear the state.
 *
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function clearState() {
  await snap.request({
    method: 'snap_manageState',

    params: {
      operation: ManageStateOperation.ClearState,
    },
  });
}

export const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
