const hre = require("hardhat");

async function main() {
  console.log("Deploying ScamReportRegistry to network:", hre.network.name);
  const ScamReportRegistry = await hre.ethers.getContractFactory("ScamReportRegistry");
  const registry = await ScamReportRegistry.deploy();
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  console.log("ScamReportRegistry deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
