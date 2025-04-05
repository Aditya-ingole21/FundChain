
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
contract FundChain {
    
struct campaign{
        address CampaigncCreator;
        string CampaignName;
        string CampaignDescription;
        uint256 CampaignTarget;
        uint256 CampaignDeadline;
        uint256 CampaignAmount;
        uint256 CampaignAmountRaised;
        // uint256 CampaignAmountWithdrawn;
        // uint256 CampaignAmountRefunded;
        // bool CampaignCompleted;


    }
    mapping (uint256 => campaign) public campaigns;
    uint256 public campaignCount;
    mapping (address => uint256) public contributions;

    event campaignCreated(address indexed creator, uint256 campaignId, string name, string description, uint256 target, uint256 deadline);
    event campaignFunded(address indexed funder, uint256 campaignId, uint256 amount);
    event campaignWithdrawn(address indexed creator, uint256 campaignId, uint256 amount);
    event campaignRefunded(address indexed funder, uint256 campaignId, uint256 amount);
    event campaignCompleted(address indexed creator, uint256 campaignId);

    function createCampaign(string memory _name, string memory _description, uint256 _target, uint256 _deadline) public {
        require(_target > 0, "Target must be greater than 0");
       uint256 campaignDeadline = block.timestamp + _deadline * 1 days;
        campaignCount++;
        campaigns[campaignCount] = campaign({
        CampaigncCreator: msg.sender,
        CampaignName: _name,
        CampaignDescription: _description,
        CampaignTarget: _target,
        CampaignDeadline: campaignDeadline, 
        CampaignAmount: 0,
        CampaignAmountRaised: 0
            });

        emit campaignCreated(msg.sender, campaignCount, _name, _description, _target, _deadline);
    }
    function fundCampaign(uint256 _campaignId) public payable {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid campaign ID");
        require(msg.value > 0, "Funding amount must be greater than 0");
        require(block.timestamp < campaigns[_campaignId].CampaignDeadline, "Campaign has ended");

        campaigns[_campaignId].CampaignAmountRaised += msg.value;
        campaigns[_campaignId].CampaignAmount += msg.value;
        contributions[msg.sender] += msg.value;

        emit campaignFunded(msg.sender, _campaignId, msg.value);
    }
    
} 