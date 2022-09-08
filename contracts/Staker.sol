// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
/*
    NFT with max supply of 100
    set lock period
    specify an nft to be allowed for staking. 1 address only
    Stake method should transfer the NFT from user's wallet to the stake contract
    user should earn .001 ETH every block while NFT is staked
    User should only be allow to unstaked the NFT after the lock-in period
    ETH rewards accumulation should stop after the user unstaked the NFT
    User should be able to claim the reward only after unstaking the NFT

*/
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
contract Staker is Ownable{
    uint public lockPeriod;
    uint public rewardsPerBlock = 0.001 ether;
    uint public constant hr = 3600;
    uint public constant day = hr*24;
    mapping(address=>Stakeinfo) accountStake;
    struct Stakeinfo{

        uint totalReward;
        uint[] stakedNFTs;
        mapping(uint=>Staked) stakedNFT;
    }
    struct Staked{
        // uint tokenId;
        bool isStaked;
        uint reward;
        uint blockNumber;
        uint blockNumberEnd;
        uint timeStaked;
        bool exists;
    }
    struct Rewards{
        uint unclaimedReward;
        uint currentStakedReward;
        uint total;
    }
    Enepti nftToBeStaked;
    constructor(address _nftAddress){
        nftToBeStaked = Enepti(_nftAddress);
        lockPeriod = hr;
    }

    function setLockPeriod(uint _lockPeriod)public onlyOwner{
        lockPeriod=_lockPeriod;
    }

    function stake(uint256 _tokenId)public{
        require(nftToBeStaked.ownerOf(_tokenId) == msg.sender, "You don't own this token");
        // nftToBeStaked.approve(address(this),_tokenId);
        nftToBeStaked.transferFrom(_msgSender(),address(this),_tokenId);

        Stakeinfo storage stakeInfo = accountStake[_msgSender()];
        if(!stakeInfo.stakedNFT[_tokenId].exists){
            stakeInfo.stakedNFTs.push(_tokenId);
        }
        Staked storage staked = stakeInfo.stakedNFT[_tokenId];
        staked.isStaked=true;
        staked.timeStaked=block.timestamp;
        staked.blockNumber=block.number;
        staked.exists=true;
    }
    function unstake(uint256 _tokenId)public{
        Stakeinfo storage stakeInfo = accountStake[_msgSender()];
        Staked storage staked = stakeInfo.stakedNFT[_tokenId];
        require(staked.isStaked,"This token is not staked");
        require(block.timestamp>(staked.timeStaked+lockPeriod),"Still on lock period");
        staked.isStaked=false;
        staked.blockNumberEnd=block.number;
        uint _reward = calculate(_tokenId);
        stakeInfo.totalReward += _reward;
        nftToBeStaked.transferFrom(address(this),_msgSender(),_tokenId);
    }

    function calculate(uint _tokenId)public view returns(uint){
        Stakeinfo storage stakeInfo = accountStake[_msgSender()];
        Staked storage staked = stakeInfo.stakedNFT[_tokenId];
        bytes memory current=bytes(Strings.toString(block.number));
        bytes memory stakedDate=bytes(Strings.toString(staked.blockNumber));
        console.log(string(bytes.concat("current:",current," - stakedDate:",stakedDate)));
        return (block.number - staked.blockNumber)*rewardsPerBlock;
    }
    function calculateCurrentStakedRewards()public view returns(uint){
        Stakeinfo storage stakeInfo = accountStake[_msgSender()];
        uint result;
        for(uint i=0;i<stakeInfo.stakedNFTs.length;i++){
            if(stakeInfo.stakedNFT[stakeInfo.stakedNFTs[i]].isStaked){
               result += calculate(stakeInfo.stakedNFTs[i]); 
            }
        }
        return result;
    }
    function viewRewards()public view returns(Rewards memory){
        Stakeinfo storage stakeInfo = accountStake[_msgSender()];
        uint currentStaked = calculateCurrentStakedRewards();
        Rewards memory rewards = Rewards( stakeInfo.totalReward, currentStaked, currentStaked + stakeInfo.totalReward);
        return rewards;
    }
    function viewStakedTokens()public view returns(uint[] memory){
        Stakeinfo storage stakeInfo = accountStake[_msgSender()];
        uint len=stakeInfo.stakedNFTs.length;
        uint j=0;
        for(uint i=0;i<len;i++){
            uint _tokenId=stakeInfo.stakedNFTs[i];
            if(stakeInfo.stakedNFT[_tokenId].isStaked){
                j++;
            }
        }
        uint[] memory result = new uint[](j);
        uint k=0;
        for(uint i=0;i<len;i++){
            uint _tokenId=stakeInfo.stakedNFTs[i];
            if(stakeInfo.stakedNFT[_tokenId].isStaked){
                result[k]=stakeInfo.stakedNFTs[i];
                k++;
            }
        }
        return result;
    }
    function viewStakedTokenInfo(uint _tokenId)external view returns(Staked memory){
        Stakeinfo storage stakeInfo = accountStake[_msgSender()];
        Staked storage staked = stakeInfo.stakedNFT[_tokenId];
        return staked;
    }

    function claimReward()public{
        Stakeinfo storage stakeInfo = accountStake[_msgSender()];
        require(stakeInfo.totalReward>0,"you dont have claimable rewards");
        console.log(stakeInfo.totalReward);
        payable(_msgSender()).transfer(stakeInfo.totalReward);
        stakeInfo.totalReward=0;
    }
    function giveEthToContract()public payable{

    }
}

contract Enepti is ERC721,Ownable {
    uint public constant MAX_SUPPLY=100;
    uint totalSupply;
    uint tokenId;
    constructor()ERC721("Enepti","Ene"){
        tokenId=0;
    }

    function mint(address _to)public onlyOwner{
        require(totalSupply<=MAX_SUPPLY,"youve reached the total token limit");
        _mint(_to,tokenId);
        tokenId++;
        totalSupply++;
    }


}