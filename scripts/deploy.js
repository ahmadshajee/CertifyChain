const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting CertifyChain deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy InstitutionRegistry
  console.log("📝 Deploying InstitutionRegistry...");
  const InstitutionRegistry = await hre.ethers.getContractFactory("InstitutionRegistry");
  const institutionRegistry = await InstitutionRegistry.deploy();
  await institutionRegistry.waitForDeployment();
  const registryAddress = await institutionRegistry.getAddress();
  console.log("✅ InstitutionRegistry deployed to:", registryAddress);

  // Deploy CredentialNFT
  console.log("\n📝 Deploying CredentialNFT...");
  const CredentialNFT = await hre.ethers.getContractFactory("CredentialNFT");
  const credentialNFT = await CredentialNFT.deploy();
  await credentialNFT.waitForDeployment();
  const nftAddress = await credentialNFT.getAddress();
  console.log("✅ CredentialNFT deployed to:", nftAddress);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(50));
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("InstitutionRegistry:", registryAddress);
  console.log("CredentialNFT:      ", nftAddress);
  console.log("\nNetwork:", hre.network.name);
  console.log("Deployer:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      InstitutionRegistry: registryAddress,
      CredentialNFT: nftAddress
    },
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n📁 Deployment info saved to deployments/${hre.network.name}.json`);

  // Verify contracts on Etherscan (if not localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n⏳ Waiting for block confirmations...");
    await credentialNFT.deploymentTransaction().wait(5);
    
    console.log("🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: registryAddress,
        constructorArguments: []
      });
      await hre.run("verify:verify", {
        address: nftAddress,
        constructorArguments: []
      });
      console.log("✅ Contracts verified on Etherscan!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
