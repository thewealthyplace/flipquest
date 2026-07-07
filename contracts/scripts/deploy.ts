import { ethers } from "hardhat";

const USDM_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying FlipQuest with:", deployer.address);

  const FlipQuest = await ethers.getContractFactory("FlipQuest");
  const flipquest = await FlipQuest.deploy(USDM_ADDRESS);
  await flipquest.waitForDeployment();

  const address = await flipquest.getAddress();
  console.log("FlipQuest deployed to:", address);
  console.log("Update FLIPQUEST_ADDRESS in frontend/lib/contracts.ts");
}

main().catch((err) => { console.error(err); process.exit(1); });
