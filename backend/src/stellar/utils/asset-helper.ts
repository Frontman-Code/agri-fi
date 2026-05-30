import { Asset, Keypair } from '@stellar/stellar-sdk';

/**
 * Validates asset code and issuer before constructing a Stellar Asset,
 * preventing SDK exceptions from malformed input.
 *
 * Rules (per Stellar protocol):
 *  - alphanum4:  1–4 alphanumeric characters
 *  - alphanum12: 5–12 alphanumeric characters
 *  - issuer must be a valid Stellar public key (G…, 56 chars, base32)
 */
export function validateAsset(code: string, issuer: string): void {
  if (!code || typeof code !== 'string') {
    throw new Error('Asset code must be a non-empty string');
  }

  const trimmed = code.trim();
  if (!/^[A-Za-z0-9]{1,12}$/.test(trimmed)) {
    throw new Error(
      `Invalid asset code "${trimmed}": must be 1–12 alphanumeric characters`,
    );
  }

  if (!issuer || typeof issuer !== 'string') {
    throw new Error('Asset issuer must be a non-empty string');
  }

  try {
    Keypair.fromPublicKey(issuer.trim());
  } catch {
    throw new Error(
      `Invalid asset issuer "${issuer}": must be a valid Stellar public key`,
    );
  }
}

/**
 * Creates a Stellar Asset after pre-flight validation.
 * Throws a descriptive error instead of letting the SDK throw an opaque one.
 */
export function createAsset(code: string, issuer: string): Asset {
  validateAsset(code, issuer);
  return new Asset(code.trim(), issuer.trim());
}
