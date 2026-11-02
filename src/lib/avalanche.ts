import { createPublicClient, http, defineChain, type Address, type Hex } from "viem";

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

// Official / Verified Fuji Contract address (or local hardhat address in test mode)
export const SCAM_REGISTRY_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_SCAM_REGISTRY_ADDRESS as Address) ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
