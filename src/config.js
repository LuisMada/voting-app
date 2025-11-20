// CONTRACT CONFIG FOR SEPOLIA TESTNET
// File: src/config.js or use directly in App.js

export const CONTRACT_ADDRESS = "0x2006B5D4F4937DF84B6bfF477050e3eD4ae30c0b";
// ⚠️ IMPORTANT: Replace with your new contract address from Remix deployment

export const CONTRACT_ABI = [
  // ========== ADMIN MANAGEMENT ==========
  {
    inputs: [{ internalType: "address", name: "_adminAddress", type: "address" }],
    name: "addAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Add new admin (owner only)"
  },
  {
    inputs: [{ internalType: "address", name: "_adminAddress", type: "address" }],
    name: "removeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Remove admin (owner only)"
  },
  {
    inputs: [],
    name: "getAdminList",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
    description: "Get list of all admin addresses"
  },

  // ========== VOTER MANAGEMENT ==========
  {
    inputs: [
      { internalType: "address", name: "_voterAddress", type: "address" },
      { internalType: "string", name: "_voterId", type: "string" }
    ],
    name: "addEligibleVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Add eligible voter (admin only, max 100)"
  },
  {
    inputs: [{ internalType: "address", name: "_voterAddress", type: "address" }],
    name: "removeEligibleVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Remove voter who hasn't voted yet (admin only)"
  },
  {
    inputs: [],
    name: "getRegisteredVoters",
    outputs: [
      {
        components: [
          { internalType: "address", name: "voterAddress", type: "address" },
          { internalType: "string", name: "voterId", type: "string" },
          { internalType: "bool", name: "isEligible", type: "bool" },
          { internalType: "uint256", name: "registeredAt", type: "uint256" }
        ],
        internalType: "struct VotingContract.VoterRecord[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function",
    description: "Get all registered voters with details"
  },
  {
    inputs: [],
    name: "getRegisteredVotersCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    description: "Get number of registered voters"
  },

  // ========== VOTING PERIOD MANAGEMENT ==========
  {
    inputs: [{ internalType: "uint256", name: "_votingDurationSeconds", type: "uint256" }],
    name: "openVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Open voting for specified duration in seconds (admin only)"
  },
  {
    inputs: [],
    name: "pauseVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Pause voting temporarily (admin only)"
  },
  {
    inputs: [],
    name: "resumeVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Resume paused voting (admin only)"
  },
  {
    inputs: [],
    name: "closeVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Close voting permanently (admin only)"
  },
  {
    inputs: [],
    name: "finalizeVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Finalize results and lock voting (admin only)"
  },
  {
    inputs: [{ internalType: "string", name: "_optionName", type: "string" }],
    name: "addOption",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Add voting option before voting starts (admin only)"
  },

  // ========== CORE VOTING ==========
  {
    inputs: [{ internalType: "uint256", name: "_optionId", type: "uint256" }],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    description: "Cast a vote for specified option (eligible voters only)"
  },

  // ========== READ FUNCTIONS ==========
  {
    inputs: [{ internalType: "uint256", name: "_optionId", type: "uint256" }],
    name: "getOption",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "voteCount", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
    description: "Get option name and vote count"
  },
  {
    inputs: [{ internalType: "uint256", name: "_optionId", type: "uint256" }],
    name: "getVotesForOption",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    description: "Get vote count for specific option"
  },
  {
    inputs: [],
    name: "getOptionsCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    description: "Get number of voting options"
  },
  {
    inputs: [],
    name: "getTotalVotes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    description: "Get total votes cast across all options"
  },
  {
    inputs: [],
    name: "getVotingDeadline",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    description: "Get voting deadline timestamp"
  },
  {
    inputs: [],
    name: "getVotingState",
    outputs: [{ internalType: "enum VotingContract.VotingState", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
    description: "Get current voting state (0=Idle, 1=Open, 2=Paused, 3=Closed, 4=Finalized)"
  },
  {
    inputs: [{ internalType: "address", name: "_voter", type: "address" }],
    name: "hasAddressVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
    description: "Check if address has voted"
  },
  {
    inputs: [{ internalType: "address", name: "_voter", type: "address" }],
    name: "isAddressEligible",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
    description: "Check if address is eligible to vote"
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    description: "Get contract owner address"
  },
  {
    inputs: [],
    name: "getWinningOption",
    outputs: [
      { internalType: "uint256", name: "optionId", type: "uint256" },
      { internalType: "string", name: "optionName", type: "string" },
      { internalType: "uint256", name: "voteCount", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function",
    description: "Get winning option (highest votes)"
  },

  // ========== STATE VARIABLES (PUBLIC) ==========
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isAdmin",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
    description: "Check if address is admin"
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
    description: "Check if address has voted"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
    description: "Contract owner address"
  },
  {
    inputs: [],
    name: "currentState",
    outputs: [{ internalType: "enum VotingContract.VotingState", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
    description: "Current voting state"
  },
  {
    inputs: [],
    name: "votingDeadline",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    description: "Voting deadline timestamp"
  },
  {
    inputs: [],
    name: "totalVotes",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
    description: "Total votes cast"
  },

  // ========== EVENTS ==========
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "adminAddress", type: "address" }],
    name: "AdminAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "adminAddress", type: "address" }],
    name: "AdminRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "voterAddress", type: "address" },
      { indexed: false, internalType: "string", name: "voterId", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "VoterAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "voterAddress", type: "address" },
      { indexed: false, internalType: "string", name: "voterId", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "VoterRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "optionName", type: "string" }],
    name: "OptionAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "votingDeadline", type: "uint256" }],
    name: "VotingOpened",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }],
    name: "VotingPaused",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }],
    name: "VotingResumed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }],
    name: "VotingClosed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "winningOptionId", type: "uint256" },
      { indexed: false, internalType: "string", name: "winningOptionName", type: "string" }
    ],
    name: "VotingFinalized",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "optionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "voter", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "VoteCast",
    type: "event"
  }
];

// Network configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

// Constants
export const MAX_VOTERS = 100;
export const VOTING_STATES = {
  0: "Idle",
  1: "Open",
  2: "Paused",
  3: "Closed",
  4: "Finalized"
};