// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract FundChain {
    
    struct campaign {
        address CampaignCreator;
        string CampaignName;
        string CampaignDescription;
        uint256 CampaignTarget;
        uint256 CampaignDeadline;
        uint256 CampaignAmount;
        uint256 CampaignAmountRaised;
        uint256 CampaignAmountWithdrawn;
        uint256 CampaignAmountRefunded;
        bool CampaignCompleted;
    }

    mapping(uint256 => campaign) public campaigns;
    uint256 public campaignCount;
    mapping(address => uint256) public contributions;

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
            CampaignCreator: msg.sender,
            CampaignName: _name,
            CampaignDescription: _description,
            CampaignTarget: _target,
            CampaignDeadline: campaignDeadline,
            CampaignAmount: 0,
            CampaignAmountRaised: 0,
            CampaignAmountWithdrawn: 0,
            CampaignAmountRefunded: 0,
            CampaignCompleted: false
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

   
    event DebugWithdraw(string message);

function withdrawFunds(uint256 _campaignId) public {
    require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid campaign ID");
    require(msg.sender == campaigns[_campaignId].CampaignCreator, "Only the campaign creator can withdraw funds");
    require(block.timestamp >= campaigns[_campaignId].CampaignDeadline, "Campaign has not ended yet");
    require(campaigns[_campaignId].CampaignAmountRaised >= campaigns[_campaignId].CampaignTarget, "Campaign target not reached");
    require(address(this).balance >= campaigns[_campaignId].CampaignAmountRaised, "Contract has insufficient balance");

    uint256 amount = campaigns[_campaignId].CampaignAmountRaised;


    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Withdraw failed");

    
    campaigns[_campaignId].CampaignAmountWithdrawn += amount;
    campaigns[_campaignId].CampaignAmountRaised = 0;

    emit campaignWithdrawn(msg.sender, _campaignId, amount);
}




    function refund(uint256 _campaignId) public {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid campaign ID");
        require(block.timestamp >= campaigns[_campaignId].CampaignDeadline, "Campaign has not ended yet");
        require(campaigns[_campaignId].CampaignAmountRaised < campaigns[_campaignId].CampaignTarget, "Campaign target reached, no refunds available");

        uint256 amount = contributions[msg.sender];
        require(amount > 0, "No contributions to refund");

        contributions[msg.sender] = 0;
        campaigns[_campaignId].CampaignAmountRefunded += amount;
        payable(msg.sender).transfer(amount);

        emit campaignRefunded(msg.sender, _campaignId, amount);
    }

    function completeCampaign(uint256 _campaignId) public {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Invalid campaign ID");
        require(msg.sender == campaigns[_campaignId].CampaignCreator, "Only the campaign creator can complete the campaign");
        require(block.timestamp >= campaigns[_campaignId].CampaignDeadline, "Campaign has not ended yet");
        require(campaigns[_campaignId].CampaignAmountRaised >= campaigns[_campaignId].CampaignTarget, "Campaign target not reached");

        campaigns[_campaignId].CampaignCompleted = true;

        emit campaignCompleted(msg.sender, _campaignId);
    }
}
