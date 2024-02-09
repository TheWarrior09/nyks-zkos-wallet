import * as zkos from 'zkos-wasm';

const generateNewFundingAccount = (signature: string, amount: number) => {
  try {
    const publicKey = zkos.generatePublicKeyFromSignature(signature);
    const rScalar = zkos.generateRandomScalar();
    const zkAccount = zkos.generateZkAccountWithBalance(
      publicKey,
      amount,
      rScalar,
    );

    return {
      zkAccount,
      rScalar,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Could not generate new funding account');
  }
};

export { generateNewFundingAccount };
