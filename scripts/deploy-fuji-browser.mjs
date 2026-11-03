import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const artifactPath = resolve("artifacts/contracts/ScamReportRegistry.sol/ScamReportRegistry.json");
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const bytecode = artifact.bytecode;
const port = 43113;

const page = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>ScamLens Fuji Contract Deployment</title><link rel="stylesheet" href="/style.css"></head>
<body>
<h1>ScamLens — Deploy Fuji Registry</h1>
<p>This local-only tool deploys <code>ScamReportRegistry</code> using the currently selected MetaMask account. MetaMask will show the transaction and requires your confirmation.</p>
<p><strong>Never enter or share a seed phrase or private key here.</strong></p>
<button id="deploy">Connect MetaMask and deploy</button>
<pre id="status">Ready.</pre>
<script src="/app.js" defer></script>
</body>
</html>`;

const appScript = `const bytecode = ${JSON.stringify(bytecode)};
const chainId = "0xa869";
const status = document.querySelector("#status");
const write = (value) => { status.textContent = value; };
const provider = (() => {
  const injected = window.ethereum;
  return injected?.providers?.find((candidate) => candidate.isMetaMask) ?? injected;
})();
async function request(method, params) {
  if (!provider) throw new Error("MetaMask was not found in this browser.");
  return provider.request({ method, params });
}
async function switchToFuji() {
  try {
    await request("wallet_switchEthereumChain", [{ chainId }]);
  } catch (error) {
    if (error?.code !== 4902) throw error;
    await request("wallet_addEthereumChain", [{
      chainId,
      chainName: "Avalanche Fuji Testnet",
      nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
      rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
      blockExplorerUrls: ["https://testnet.snowtrace.io"]
    }]);
    await request("wallet_switchEthereumChain", [{ chainId }]);
  }
}
async function waitForReceipt(hash) {
  for (;;) {
    const receipt = await request("eth_getTransactionReceipt", [hash]);
    if (receipt) return receipt;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
document.querySelector("#deploy").addEventListener("click", async () => {
  try {
    write("Requesting MetaMask account access...");
    const accounts = await request("eth_requestAccounts");
    const from = accounts?.[0];
    if (!from) throw new Error("No MetaMask account was authorized.");
    await switchToFuji();
    write("Deploying. Confirm the contract transaction in MetaMask...");
    const hash = await request("eth_sendTransaction", [{ from, data: bytecode }]);
    write("Transaction submitted: " + hash + "\\nWaiting for confirmation...");
    const receipt = await waitForReceipt(hash);
    if (receipt.status !== "0x1") throw new Error("Deployment transaction reverted.");
    write("Deployment complete.\\n\\nContract address:\\n" + receipt.contractAddress + "\\n\\nAdd this as NEXT_PUBLIC_SCAM_REGISTRY_ADDRESS in Vercel, then redeploy.");
  } catch (error) {
    write("Deployment failed: " + (error?.message || "Unknown error"));
  }
});`;

const server = createServer((request, response) => {
  if (request.url === "/") {
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'none'",
    });
    response.end(page);
    return;
  }
  if (request.url === "/style.css") {
    response.writeHead(200, {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end("body{font:16px system-ui;max-width:760px;margin:48px auto;padding:0 20px}button{padding:12px 18px;font-weight:700}pre{white-space:pre-wrap;word-break:break-word;background:#f3f4f6;padding:12px;border-radius:8px}");
    return;
  }
  if (request.url === "/app.js") {
    response.writeHead(200, {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(appScript);
    return;
  }
  response.writeHead(404);
  response.end("Not found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Open http://127.0.0.1:${port} in Brave with MetaMask installed.`);
});
