const { expect } = require("chai");
const { loadFixture } = require("ethereum-waffle");
const { ethers } = require("hardhat");
let staker;
let nft;
  async function testFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, acct1, acct2, acct3, acct4, acct5, acct6] =
      await ethers.getSigners();

    return { owner, acct1, acct2, acct3, acct4, acct5, acct6 };
  }
describe("test",
  ()=>{
    beforeEach(async()=>{
      const stakerABI = await ethers.getContractFactory("Staker");
      const nftABI = await ethers.getContractFactory("Enepti");
      nft = await nftABI.deploy();
      staker = await stakerABI.deploy(nft.address);

   
    });

    describe("deployed",()=>{
      it("should be deployed and set to correct owner",async()=>{
        const { owner, acct1 } = await loadFixture(testFixture);
        expect(await staker.owner()).to.equal(owner.address);
      });
    });
    describe("transact",()=>{
        it("should mint",async()=>{
            const { owner, acct1, acct2, acct3, acct4, acct5, } = await loadFixture(testFixture);

            //mint
            await nft.mint(acct1.address);
            await nft.mint(acct1.address);
            expect( await nft.balanceOf(acct1.address)).to.equal(2);
            expect( await nft.ownerOf(0)).to.equal(acct1.address);
            expect( await nft.ownerOf(1)).to.equal(acct1.address);

        });
        it("should stake",async()=>{
            const { owner, acct1, acct2, acct3, acct4, acct5, } = await loadFixture(testFixture);

            //mint
            await nft.mint(acct1.address);
            await nft.mint(acct1.address);
            expect( await nft.balanceOf(acct1.address)).to.equal(2);
            expect( await nft.ownerOf(0)).to.equal(acct1.address);
            expect( await nft.ownerOf(1)).to.equal(acct1.address);

            //stake
            await nft.connect(acct1).approve(staker.address,0);
            await staker.connect(acct1).stake(0);
            expect( await nft.ownerOf(0)).to.equal(staker.address);

            await nft.connect(acct1).approve(staker.address,1);
            await staker.connect(acct1).stake(1);
            expect( await nft.ownerOf(1)).to.equal(staker.address);
        });
        it("should unstake",async()=>{
            const { owner, acct1, acct2, acct3, acct4, acct5, } = await loadFixture(testFixture);

            //mint
            await nft.mint(acct1.address);
            await nft.mint(acct1.address);
            expect( await nft.balanceOf(acct1.address)).to.equal(2);
            expect( await nft.ownerOf(0)).to.equal(acct1.address);
            expect( await nft.ownerOf(1)).to.equal(acct1.address);

            //stake
            await nft.connect(acct1).approve(staker.address,0);
            await staker.connect(acct1).stake(0);
            expect( await nft.ownerOf(0)).to.equal(staker.address);

            await nft.connect(acct1).approve(staker.address,1);
            await staker.connect(acct1).stake(1);
            expect( await nft.ownerOf(1)).to.equal(staker.address);


            //give 50 eth to contract for rewards
            await staker.connect(acct5).giveEthToContract({value:"50000000000000000000"});

            //locked by 1 hr
            await expect(staker.connect(acct1).unstake(0)).to.be.reverted;
            //fast forward 1 hr
            await ethers.provider.send("evm_increaseTime", [3600]);

            //unstake
            await staker.connect(acct1).unstake(0);
            expect( await nft.ownerOf(0)).to.equal(acct1.address);
        });
        it("should claim reward",async()=>{
            const { owner, acct1, acct2, acct3, acct4, acct5, } = await loadFixture(testFixture);

            //mint
            await nft.mint(acct1.address);
            await nft.mint(acct1.address);
            expect( await nft.balanceOf(acct1.address)).to.equal(2);
            expect( await nft.ownerOf(0)).to.equal(acct1.address);
            expect( await nft.ownerOf(1)).to.equal(acct1.address);

            //stake
            await nft.connect(acct1).approve(staker.address,0);
            await staker.connect(acct1).stake(0);
            expect( await nft.ownerOf(0)).to.equal(staker.address);

            await nft.connect(acct1).approve(staker.address,1);
            await staker.connect(acct1).stake(1);
            expect( await nft.ownerOf(1)).to.equal(staker.address);


            //give 50 eth to contract for rewards
            await staker.connect(acct5).giveEthToContract({value:"50000000000000000000"});

            //locked by 1 hr
            await expect(staker.connect(acct1).unstake(0)).to.be.reverted;
            //fast forward 1 hr
            await ethers.provider.send("evm_increaseTime", [3600]);

            //unstake
            await staker.connect(acct1).unstake(0);
            expect( await nft.ownerOf(0)).to.equal(acct1.address);

            console.log(await staker.connect(acct1).viewRewards());

            const initialBal = await ethers.provider.getBalance(acct1.address);
            await staker.connect(acct1).claimReward();
            
            const currentBalance = await ethers.provider.getBalance(acct1.address);
            console.log(currentBalance-initialBal);
            console.log(await staker.connect(acct1).viewRewards());
            expect(currentBalance).to.be.greaterThan(initialBal);
        });
        it("should handle transactions",async()=>{
            const { owner, acct1, acct2, acct3, acct4, acct5, } = await loadFixture(testFixture);

            //mint
            await nft.mint(acct1.address);
            await nft.mint(acct1.address);
            expect( await nft.balanceOf(acct1.address)).to.equal(2);
            expect( await nft.ownerOf(0)).to.equal(acct1.address);
            expect( await nft.ownerOf(1)).to.equal(acct1.address);

            //stake
            await nft.connect(acct1).approve(staker.address,0);
            await staker.connect(acct1).stake(0);
            expect( await nft.ownerOf(0)).to.equal(staker.address);

            await nft.connect(acct1).approve(staker.address,1);
            await staker.connect(acct1).stake(1);
            expect( await nft.ownerOf(1)).to.equal(staker.address);


            //give 50 eth to contract for rewards
            await staker.connect(acct5).giveEthToContract({value:"50000000000000000000"});

            //locked by 1 hr
            await expect(staker.connect(acct1).unstake(0)).to.be.reverted;
            //fast forward 1 hr
            await ethers.provider.send("evm_increaseTime", [3600]);

            //unstake
            await staker.connect(acct1).unstake(0);
            expect( await nft.ownerOf(0)).to.equal(acct1.address);

            // console.log(await staker.connect(acct1).viewStakedTokenInfo(0));
            console.log(await staker.connect(acct1).viewRewards());

            const initialBal = await ethers.provider.getBalance(acct1.address);
            await staker.connect(acct1).claimReward();
            
            console.log(await staker.connect(acct1).viewRewards());

            await ethers.provider.send("evm_increaseTime", [3600]);

            await expect (staker.connect(acct1).unstake(0)).to.be.reverted;
            
            await staker.connect(acct1).unstake(1);
            console.log(await staker.connect(acct1).viewRewards());

            await ethers.provider.send("evm_increaseTime", [3600]);
            console.log(await staker.connect(acct1).viewRewards());
            
            const currentBalance = await ethers.provider.getBalance(acct1.address);
            expect(currentBalance).to.be.greaterThan(initialBal);
        });
    });
  }
);