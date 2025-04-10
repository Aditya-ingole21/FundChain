import { ethers } from "ethers"

// ABI for the FundChain contract
const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256",
      },
    ],
    name: "createCampaign",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_campaignId",
        type: "uint256",
      },
    ],
    name: "fundCampaign",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_campaignId",
        type: "uint256",
      },
    ],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_campaignId",
        type: "uint256",
      },
    ],
    name: "refund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_campaignId",
        type: "uint256",
      },
    ],
    name: "completeCampaign",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "campaignCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "campaigns",
    outputs: [
      {
        internalType: "address",
        name: "CampaignCreator",
        type: "address",
      },
      {
        internalType: "string",
        name: "CampaignName",
        type: "string",
      },
      {
        internalType: "string",
        name: "CampaignDescription",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "CampaignTarget",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "CampaignDeadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "CampaignAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "CampaignAmountRaised",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "CampaignAmountWithdrawn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "CampaignAmountRefunded",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "CampaignCompleted",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "contributions",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

// Replace with your deployed contract address
const contractAddress = "0xYourContractAddressHere"

export const getContract = async (providerOrSigner) => {
  return new ethers.Contract(contractAddress, contractABI, providerOrSigner)
}
