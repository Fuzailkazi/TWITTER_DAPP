// const hre = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  const twitter = await ethers.deployContract('Twitter');

  console.log('Token address:', await twitter.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
// const hre = require('hardhat');
// const main = async () => {
//   const contractFactory = await hre.ethers.getContractFactory('Twitter');
//   const contract = await contractFactory.deploy();
//   await contract.deployed();

//   console.log('Contract deployed to: ', contract.getAddress());
// };

// const runMain = async () => {
//   try {
//     await main();
//     process.exit(0);
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

// runMain();
