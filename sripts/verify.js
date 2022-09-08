const console = require("console")
const hre = require("hardhat")

// Define the NFT

async function verifyAndPublish(address, constructorArguments) {
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: constructorArguments,
  })
}

verifyAndPublish(
  "0xBd23BcE4B46ba4De991e3B0b014F89A148161Ae2",
  ["0x886667B251E08D5bB990047C6e9E0BB611F798f7"]
).then(() => {
  console.log("Successfully deployed the contract")
}).catch((err) => {
  console.log("Error deploying the contract")
  console.log(err)
})