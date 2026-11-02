import { keccak256, toHex, stringToBytes, encodePacked, type Hex, type Address } from "viem";

/**
 * Generates a random cryptographic salt (32 bytes).
 */
export function generateRandomSalt(): Hex {
  const randomValues = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < 32; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }
  return toHex(randomValues);
}

/**
 * Creates a sanitized, normalized representation of suspicious text or URL.
 * Strips whitespace, normalizes Unicode, and hashes the content.
 */
export function hashSanitizedContent(content: string): Hex {
  const normalized = content.trim().normalize("NFKC");
  return keccak256(stringToBytes(normalized));
}

/**
 * Computes the on-chain cryptographic commitment:
 * commitment = keccak256(abi.encodePacked(contentHash, salt, reporterAddress))
 *
 * This prevents rainbow table attacks and protects privacy since only someone who
 * possesses the exact content + salt + reporter can re-derive and prove it.
 */
export function computeReportCommitment(
  contentHash: Hex,
  salt: Hex,
  reporter: Address
): Hex {
  return keccak256(
    encodePacked(
      ["bytes32", "bytes32", "address"],
      [contentHash, salt, reporter]
    )
  );
}

/**
 * Formats a category enum string to the contract's uint8 enum index
 */
export function mapCategoryToContractEnum(category: string): number {
  switch (category) {
    case "fake_bank_support":
      return 0;
    case "fraudulent_transfer":
      return 1;
    case "ponzi_investment":
      return 2;
    case "relative_impersonation":
      return 3;
    case "suspicious_qr":
      return 4;
    case "phishing_url":
      return 5;
    case "fake_ecommerce":
      return 6;
    case "urgent_debt_threat":
      return 7;
    default:
      return 8; // Other
  }
}
