
// const fs = require('fs');
async function deploy_Test() {
    console.log("Deploying Test...");
    console.log("------------------------------------------------------");
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Multisig = await ethers.getContractFactory("Multisig");
  
    const multisigContract = await Multisig.deploy();
    await multisigContract.deployed();
  
    // const data ={
    //   address: contract.address,
    //   abi: JSON.parse(contract.interface.format('json'))
    // };
    // fs.writeFileSync('frontend/src/XTokenConvert.json',JSON.stringify(data));
  
    console.log("[Test] address:", multisigContract.address);
  
    return multisigContract.address;
  }
  
  deploy_Test()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  