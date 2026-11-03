import { createPublicClient, http, defineChain, isAddress, zeroAddress, type Address, type Hex } from "viem";

// Avalanche Fuji Testnet definition
export const avalancheFuji = defineChain({
  id: 43113,
  name: "Avalanche Fuji Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: {
      http: ["https://api.avax-test.network/ext/bc/C/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "SnowTrace (Testnet)",
      url: "https://testnet.snowtrace.io",
    },
  },
  testnet: true,
});

// This verified Fuji deployment is public configuration, not a secret.
const DEFAULT_FUJI_REGISTRY_ADDRESS =
  "0x9484845d9d8d5a5bbf7b23b88fcc7e3b6dbc3802" as Address;
const configuredRegistryAddress =
  process.env.NEXT_PUBLIC_SCAM_REGISTRY_ADDRESS || DEFAULT_FUJI_REGISTRY_ADDRESS;
const validRegistryAddress = isAddress(configuredRegistryAddress)
  ? (configuredRegistryAddress as Address)
  : undefined;
export const SCAM_REGISTRY_CONFIGURED = Boolean(validRegistryAddress);
export const SCAM_REGISTRY_ADDRESS: Address = validRegistryAddress ?? zeroAddress;

export const SCAM_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "commitment", type: "bytes32" },
      { internalType: "uint8", name: "category", type: "uint8" },
      { internalType: "uint8", name: "riskScore", type: "uint8" },
      { internalType: "string", name: "metadataUri", type: "string" },
    ],
    name: "submitReport",
    outputs: [{ internalType: "uint256", name: "reportId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "reportId", type: "uint256" },
      { internalType: "bytes32", name: "contentHash", type: "bytes32" },
      { internalType: "bytes32", name: "salt", type: "bytes32" },
    ],
    name: "verifyCommitment",
    outputs: [{ internalType: "bool", name: "isValid", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "reportId", type: "uint256" }],
    name: "reports",
    outputs: [
      { internalType: "bytes32", name: "commitment", type: "bytes32" },
      { internalType: "uint8", name: "category", type: "uint8" },
      { internalType: "uint8", name: "riskScore", type: "uint8" },
      { internalType: "uint64", name: "timestamp", type: "uint64" },
      { internalType: "address", name: "reporter", type: "address" },
      { internalType: "uint8", name: "status", type: "uint8" },
      { internalType: "string", name: "metadataUri", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalReports",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "offset", type: "uint256" },
      { internalType: "uint256", name: "limit", type: "uint256" },
    ],
    name: "getRecentReports",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "commitment", type: "bytes32" },
          { internalType: "uint8", name: "category", type: "uint8" },
          { internalType: "uint8", name: "riskScore", type: "uint8" },
          { internalType: "uint64", name: "timestamp", type: "uint64" },
          { internalType: "address", name: "reporter", type: "address" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "string", name: "metadataUri", type: "string" },
        ],
        internalType: "struct ScamReportRegistry.Report[]",
        name: "result",
        type: "tuple[]",
      },
      { internalType: "uint256", name: "nextOffset", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "reportId", type: "uint256" },
      { internalType: "bytes32", name: "reasonHash", type: "bytes32" },
    ],
    name: "disputeReport",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function getPublicFujiClient() {
  return createPublicClient({
    chain: avalancheFuji,
    transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
  });
}

export function getExplorerTxUrl(txHash: string): string {
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://testnet.snowtrace.io/address/${address}`;
}
