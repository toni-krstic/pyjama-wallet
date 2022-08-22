async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PyjamaWallet = await ethers.getContractFactory("PyjamaWallet");
  const pyjamaWallet = await PyjamaWallet.deploy();

  console.log("Pyjama wallet address:", pyjamaWallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
