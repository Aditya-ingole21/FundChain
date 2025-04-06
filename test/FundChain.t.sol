// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FundChain.sol";

contract FundChainTest is Test {
    FundChain fundChain;
    address campaignCreator = address(1);  // Mock address for campaign creator
    address funder = address(2);          // Mock address for funder

    function setUp() public {
        fundChain = new FundChain();
        vm.deal(campaignCreator, 10 ether); // Give the campaign creator some ETH
        vm.deal(funder, 10 ether);          // Give the funder some ETH
    }

    function testCreateCampaign() public {
        vm.prank(campaignCreator);
        fundChain.createCampaign("Tech for All", "Fund tech education", 5 ether, 2);

        (address creator, , , uint256 target, uint256 deadline, , , , , ) = fundChain.campaigns(1);
        assertEq(creator, campaignCreator);
        assertEq(target, 5 ether);
        assertGt(deadline, block.timestamp);
    }

    function testFundCampaign() public {
        vm.prank(campaignCreator);
        fundChain.createCampaign("Tech for All", "Fund tech education", 5 ether, 2);

        vm.prank(funder);
        vm.deal(funder, 5 ether); // Ensure funder has ETH
        fundChain.fundCampaign{value: 5 ether}(1);

        (, , , , , , uint256 amountRaised, , , ) = fundChain.campaigns(1);
        assertEq(amountRaised, 5 ether);
    }

    function testWithdrawFunds() public {
        vm.prank(campaignCreator);
        fundChain.createCampaign("Tech for All", "Fund tech education", 5 ether, 2);

        vm.prank(funder);
        fundChain.fundCampaign{value: 5 ether}(1);

        vm.warp(block.timestamp + 3 days); // Move time beyond deadline

        uint256 initialBalance = campaignCreator.balance;
        vm.prank(campaignCreator);
        fundChain.withdrawFunds(1);
        
        uint256 newBalance = campaignCreator.balance;
        assertGt(newBalance, initialBalance);
    }

    function testRefund() public {
        vm.prank(campaignCreator);
        fundChain.createCampaign("Tech for All", "Fund tech education", 10 ether, 2);

        vm.prank(funder);
        fundChain.fundCampaign{value: 3 ether}(1);

        vm.warp(block.timestamp + 3 days); // Move past deadline

        uint256 initialBalance = funder.balance;
        vm.prank(funder);
        fundChain.refund(1);

        uint256 newBalance = funder.balance;
        assertGt(newBalance, initialBalance);
    }

    function testCompleteCampaign() public {
        vm.prank(campaignCreator);
        fundChain.createCampaign("Tech for All", "Fund tech education", 5 ether, 2);

        vm.prank(funder);
        fundChain.fundCampaign{value: 5 ether}(1);

        vm.warp(block.timestamp + 3 days); // Move past deadline

        vm.prank(campaignCreator);
        fundChain.completeCampaign(1);

        (, , , , , , , , , bool completed) = fundChain.campaigns(1);
        assertTrue(completed);
    }
}
