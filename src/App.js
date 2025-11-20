import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { ethers } from 'ethers';

// ============================================================
// CONTRACT CONFIG
// ============================================================
const CONTRACT_ADDRESS = '0x2006B5D4F4937DF84B6bfF477050e3eD4ae30c0b';
const SEPOLIA_CHAIN_ID = '11155111';

const CONTRACT_ABI = [
  // Admin functions
  {
    inputs: [{ internalType: 'address', name: '_adminAddress', type: 'address' }],
    name: 'addAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_adminAddress', type: 'address' }],
    name: 'removeAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getAdminList',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Voter functions
  {
    inputs: [
      { internalType: 'address', name: '_voterAddress', type: 'address' },
      { internalType: 'string', name: '_voterId', type: 'string' }
    ],
    name: 'addEligibleVoter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_voterAddress', type: 'address' }],
    name: 'removeEligibleVoter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getRegisteredVoters',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'voterAddress', type: 'address' },
          { internalType: 'string', name: 'voterId', type: 'string' },
          { internalType: 'bool', name: 'isEligible', type: 'bool' },
          { internalType: 'uint256', name: 'registeredAt', type: 'uint256' }
        ],
        internalType: 'struct VotingContract.VoterRecord[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getRegisteredVotersCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Voting period functions
  {
    inputs: [{ internalType: 'uint256', name: '_votingDurationSeconds', type: 'uint256' }],
    name: 'openVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pauseVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'resumeVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'closeVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'finalizeVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'string', name: '_optionName', type: 'string' }],
    name: 'addOption',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // Vote function
  {
    inputs: [{ internalType: 'uint256', name: '_optionId', type: 'uint256' }],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // View functions
  {
    inputs: [{ internalType: 'uint256', name: '_optionId', type: 'uint256' }],
    name: 'getOption',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'uint256', name: 'voteCount', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getOptionsCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTotalVotes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getVotingDeadline',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getVotingState',
    outputs: [{ internalType: 'enum VotingContract.VotingState', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_voter', type: 'address' }],
    name: 'hasAddressVoted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_voter', type: 'address' }],
    name: 'isAddressEligible',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getWinningOption',
    outputs: [
      { internalType: 'uint256', name: 'optionId', type: 'uint256' },
      { internalType: 'string', name: 'optionName', type: 'string' },
      { internalType: 'uint256', name: 'voteCount', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

const VOTING_STATES = {
  0: 'Idle',
  1: 'Open',
  2: 'Paused',
  3: 'Closed',
  4: 'Finalized'
};

function App() {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [votingState, setVotingState] = useState(null);
  const [options, setOptions] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingDeadline, setVotingDeadline] = useState(null);
  const [owner, setOwner] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [registeredVoters, setRegisteredVoters] = useState([]);
  const [winningOption, setWinningOption] = useState(null);

  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [adminDuration, setAdminDuration] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [toast, setToast] = useState(null);
  const updateIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Voter management states
  const [voterAddress, setVoterAddress] = useState('');
  const [voterId, setVoterId] = useState('');
  const [voterError, setVoterError] = useState('');
  const [addressError, setAddressError] = useState('');

  // Admin management states
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [adminError, setAdminError] = useState('');

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  const showToast = (message, type = 'success', txHash = null) => {
    setToast({ message, type, txHash });
    setTimeout(() => setToast(null), 4000);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'Expired';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    return remaining > 0 ? remaining : 0;
  };

  const validateEthereumAddress = (address) => {
    return ethers.isAddress(address);
  };

  // ============================================================
  // WALLET CONNECTION
  // ============================================================

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        showToast('MetaMask not detected', 'error');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdDecimal = parseInt(chainId, 16);

      if (chainIdDecimal !== parseInt(SEPOLIA_CHAIN_ID)) {
        setWrongNetwork(true);
        showToast('Please switch to Sepolia testnet', 'error');
        return;
      }

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);

      setProvider(newProvider);
      setSigner(newSigner);
      setContract(newContract);
      setAccount(accounts[0]);
      setIsConnected(true);
      setWrongNetwork(false);

      showToast('Wallet connected!', 'success');
    } catch (error) {
      console.error('Connection error:', error);
      showToast('Failed to connect wallet', 'error');
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + SEPOLIA_CHAIN_ID.toString(16) }]
      });
      setWrongNetwork(false);
      setTimeout(() => connectWallet(), 500);
    } catch (error) {
      console.error('Network switch error:', error);
      showToast('Failed to switch network', 'error');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setContract(null);
    setProvider(null);
    setSigner(null);
    setIsOwner(false);
    setIsAdmin(false);
    setIsEligible(false);
    setHasVoted(false);
    showToast('Wallet disconnected', 'success');
  };

  // ============================================================
  // CONTRACT INTERACTIONS
  // ============================================================

  const fetchContractState = async (contractInstance) => {
    try {
      if (!contractInstance) return;

      // Fetch voting state
      const state = await contractInstance.getVotingState();
      setVotingState(Number(state));

      // Fetch options and votes
      const optionsCount = await contractInstance.getOptionsCount();
      const optionsData = [];
      for (let i = 0; i < optionsCount; i++) {
        const [name, voteCount] = await contractInstance.getOption(i);
        optionsData.push({ id: i, name, voteCount: Number(voteCount) });
      }
      setOptions(optionsData);

      // Fetch total votes
      const total = await contractInstance.getTotalVotes();
      setTotalVotes(Number(total));

      // Fetch deadline
      const deadline = await contractInstance.getVotingDeadline();
      setVotingDeadline(Number(deadline));

      // Fetch owner and admins
      const ownerAddress = await contractInstance.getOwner();
      setOwner(ownerAddress);

      const adminList = await contractInstance.getAdminList();
      setAdmins(adminList);

      // Fetch registered voters
      const voters = await contractInstance.getRegisteredVoters();
      setRegisteredVoters(voters);

      // Fetch winning option if finalized
      const currentState = Number(state);
      if (currentState === 4) { // Finalized
        const [winId, winName, winVotes] = await contractInstance.getWinningOption();
        setWinningOption({ id: Number(winId), name: winName, voteCount: Number(winVotes) });
      } else {
        setWinningOption(null);
      }

      // Check user status if account connected
      if (account) {
        const eligible = await contractInstance.isAddressEligible(account);
        setIsEligible(eligible);

        const voted = await contractInstance.hasAddressVoted(account);
        setHasVoted(voted);

        setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
        setIsAdmin(adminList.some(a => a.toLowerCase() === account.toLowerCase()) || ownerAddress.toLowerCase() === account.toLowerCase());
      }
    } catch (error) {
      console.error('Error fetching contract state:', error);
    }
  };

  const handleOpenVoting = async () => {
    if (!adminDuration || isNaN(adminDuration) || adminDuration <= 0) {
      showToast('Enter valid duration in minutes', 'error');
      return;
    }

    setLoading(true);
    try {
      const durationSeconds = Math.floor(adminDuration * 60);
      const tx = await contract.openVoting(durationSeconds);
      const receipt = await tx.wait();

      showToast('Voting opened successfully!', 'success', receipt.hash);
      setAdminDuration('');
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Open voting error:', error);
      showToast(error.message || 'Failed to open voting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseVoting = async () => {
    if (votingState !== 1) {
      showToast('Voting is not open', 'error');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.pauseVoting();
      const receipt = await tx.wait();

      showToast('Voting paused!', 'success', receipt.hash);
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Pause voting error:', error);
      showToast(error.message || 'Failed to pause voting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeVoting = async () => {
    if (votingState !== 2) {
      showToast('Voting is not paused', 'error');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.resumeVoting();
      const receipt = await tx.wait();

      showToast('Voting resumed!', 'success', receipt.hash);
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Resume voting error:', error);
      showToast(error.message || 'Failed to resume voting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseVoting = async () => {
    setLoading(true);
    try {
      const tx = await contract.closeVoting();
      const receipt = await tx.wait();

      showToast('Voting closed successfully!', 'success', receipt.hash);
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Close voting error:', error);
      showToast(error.message || 'Failed to close voting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeVoting = async () => {
    setLoading(true);
    try {
      const tx = await contract.finalizeVoting();
      const receipt = await tx.wait();

      showToast('Voting finalized successfully!', 'success', receipt.hash);
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Finalize voting error:', error);
      showToast(error.message || 'Failed to finalize voting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId) => {
    setLoading(true);
    try {
      const tx = await contract.vote(optionId);
      const receipt = await tx.wait();

      showToast('Vote cast successfully!', 'success', receipt.hash);
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Vote error:', error);
      showToast(error.message || 'Failed to cast vote', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEligibleVoter = async () => {
    // Reset errors
    setVoterError('');
    setAddressError('');

    // Validation
    if (!voterAddress || !voterId) {
      showToast('Please enter both address and voter ID', 'error');
      return;
    }

    if (!validateEthereumAddress(voterAddress)) {
      setAddressError('Invalid Ethereum address');
      showToast('Invalid Ethereum address', 'error');
      return;
    }

    if (registeredVoters.some(v => v.voterAddress.toLowerCase() === voterAddress.toLowerCase())) {
      setAddressError('Address already registered');
      showToast('Address already registered', 'error');
      return;
    }

    if (registeredVoters.some(v => v.voterId === voterId)) {
      setVoterError('Voter ID already taken');
      showToast('Voter ID already taken', 'error');
      return;
    }

    if (registeredVoters.length >= 100) {
      showToast('Maximum 100 voters reached', 'error');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.addEligibleVoter(voterAddress, voterId);
      const receipt = await tx.wait();

      showToast('Voter added successfully!', 'success', receipt.hash);
      setVoterAddress('');
      setVoterId('');
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Add voter error:', error);
      showToast(error.message || 'Failed to add voter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoter = async (voterToRemove) => {
    setLoading(true);
    try {
      const tx = await contract.removeEligibleVoter(voterToRemove);
      const receipt = await tx.wait();

      showToast('Voter removed successfully!', 'success', receipt.hash);
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Remove voter error:', error);
      showToast(error.message || 'Failed to remove voter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    setAdminError('');

    if (!newAdminAddress) {
      showToast('Please enter admin address', 'error');
      return;
    }

    if (!validateEthereumAddress(newAdminAddress)) {
      setAdminError('Invalid Ethereum address');
      showToast('Invalid Ethereum address', 'error');
      return;
    }

    if (admins.some(a => a.toLowerCase() === newAdminAddress.toLowerCase())) {
      setAdminError('Already an admin');
      showToast('Already an admin', 'error');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.addAdmin(newAdminAddress);
      const receipt = await tx.wait();

      showToast('Admin added successfully!', 'success', receipt.hash);
      setNewAdminAddress('');
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Add admin error:', error);
      showToast(error.message || 'Failed to add admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminToRemove) => {
    setLoading(true);
    try {
      const tx = await contract.removeAdmin(adminToRemove);
      const receipt = await tx.wait();

      showToast('Admin removed successfully!', 'success', receipt.hash);
      setTimeout(() => fetchContractState(contract), 1000);
    } catch (error) {
      console.error('Remove admin error:', error);
      showToast(error.message || 'Failed to remove admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    if (contract) {
      fetchContractState(contract);

      updateIntervalRef.current = setInterval(() => {
        fetchContractState(contract);
      }, 3000);

      return () => clearInterval(updateIntervalRef.current);
    }
  }, [contract, account]);

  useEffect(() => {
    if (votingState === 1 && votingDeadline) {
      timerIntervalRef.current = setInterval(() => {
        const remaining = calculateTimeRemaining(votingDeadline);
        setTimeRemaining(remaining);
      }, 1000);

      const remaining = calculateTimeRemaining(votingDeadline);
      setTimeRemaining(remaining);

      return () => clearInterval(timerIntervalRef.current);
    } else {
      setTimeRemaining(null);
    }
  }, [votingState, votingDeadline]);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAccount(null);
      } else {
        setAccount(accounts[0]);
        if (contract) {
          fetchContractState(contract);
        }
      }
    };

    const handleChainChanged = (chainId) => {
      const chainIdDecimal = parseInt(chainId, 16);
      if (chainIdDecimal !== SEPOLIA_CHAIN_ID) {
        setWrongNetwork(true);
      } else {
        setWrongNetwork(false);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [contract]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="app">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span>{toast.message}</span>
            {toast.txHash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${toast.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="toast-link"
              >
                View tx
              </a>
            )}
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-title-section">
              <img src="/logo.png" alt="Voting System Logo" className="logo" />
              <div className="title-text">
                <h1 className="title">SulatChain</h1>
                <p className="subtitle">Blockchain-powered voting on Sepolia</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            {!isConnected ? (
              <button className="btn btn-primary" onClick={connectWallet}>
                Connect MetaMask
              </button>
            ) : wrongNetwork ? (
              <button className="btn btn-destructive" onClick={switchNetwork}>
                Switch to Sepolia
              </button>
            ) : (
              <div className="wallet-info">
                <div className="wallet-status">
                  <span className="status-badge">Connected</span>
                  <span className="wallet-address">{formatAddress(account)}</span>
                </div>
                <button className="btn btn-secondary" onClick={disconnectWallet}>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {isConnected && !wrongNetwork ? (
        <main className="main-content">
          {/* User Status Section */}
          <section className="user-status">
            <div className="status-grid">
              <div className={`status-card ${isOwner ? 'active' : ''}`}>
                <div className="status-label">Role</div>
                <div className="status-value">
                  {isOwner ? '👑 Owner' : isAdmin ? '🔧 Admin' : '🗳️ Voter'}
                </div>
              </div>
              <div className={`status-card ${isEligible ? 'active' : ''}`}>
                <div className="status-label">Eligible</div>
                <div className="status-value">
                  {isEligible ? '✓ Yes' : '✗ No'}
                </div>
              </div>
              <div className={`status-card ${hasVoted ? 'active' : ''}`}>
                <div className="status-label">Voted</div>
                <div className="status-value">
                  {hasVoted ? '✓ Yes' : '✗ No'}
                </div>
              </div>
            </div>
          </section>

          {/* Voting Status Section */}
          <section className="voting-status">
            <div className="status-box">
              <div className="status-header">
                <h2>Voting Status</h2>
                <div className={`status-badge-large ${votingState === 2 ? 'paused' : ''}`}>
                  {votingState !== null ? VOTING_STATES[votingState] : 'Loading...'}
                </div>
              </div>

              {votingState === 2 && (
                <div className="voting-paused-message">
                  ⏸️ Voting is currently paused
                </div>
              )}

              <div className="status-details">
                <div className="detail-row">
                  <span>Total Votes Cast:</span>
                  <strong>{totalVotes}</strong>
                </div>

                {(votingState === 1 || votingState === 2) && votingDeadline && (
                  <div className="detail-row countdown">
                    <span>Time Remaining:</span>
                    <strong className="timer">
                      {formatTime(timeRemaining || 0)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Leaderboard Section */}
          <section className="leaderboard-section">
            <h2>Leaderboard</h2>
            <div className="leaderboard">
              {options.length === 0 ? (
                <p className="leaderboard-empty">No voting options yet</p>
              ) : (
                options
                  .map((opt, idx) => ({
                    ...opt,
                    percentage: totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0
                  }))
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((opt, rank) => (
                    <div key={opt.id} className="leaderboard-item">
                      <div className="leaderboard-rank">
                        {rank === 0 && winningOption && votingState === 4 ? '🏆' : `${rank + 1}`}
                      </div>
                      <div className="leaderboard-name">{opt.name}</div>
                      <div className="leaderboard-votes">{opt.voteCount} votes</div>
                      <div className="leaderboard-percentage">{opt.percentage.toFixed(1)}%</div>
                    </div>
                  ))
              )}
            </div>
          </section>

          {/* Winner Announcement */}
          {votingState === 4 && winningOption && (
            <section className="winner-announcement">
              <div className="winner-card">
                <div className="winner-emoji">🏆</div>
                <h2>Voting Complete!</h2>
                <div className="winner-name">{winningOption.name}</div>
                <div className="winner-votes">
                  {winningOption.voteCount} vote{winningOption.voteCount !== 1 ? 's' : ''}
                </div>
              </div>
            </section>
          )}

          {/* Voting Options Section */}
          {votingState !== 4 && (
            <section className="voting-options">
              <h2>Cast Your Vote</h2>
              <div className="options-grid">
                {options.map((option) => {
                  const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
                  const canVote =
                    votingState === 1 &&
                    isEligible &&
                    !hasVoted &&
                    timeRemaining > 0;

                  return (
                    <div key={option.id} className="option-card">
                      <div className="option-header">
                        <h3>{option.name}</h3>
                        <div className="vote-count">{option.voteCount}</div>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <div className="progress-label">
                        {percentage.toFixed(1)}%
                      </div>

                      {canVote && (
                        <button
                          className="btn btn-primary btn-vote"
                          onClick={() => handleVote(option.id)}
                          disabled={loading}
                        >
                          {loading ? 'Voting...' : 'Vote'}
                        </button>
                      )}

                      {votingState === 2 && (
                        <div className="voting-paused-disabled">
                          ⏸️ Voting Paused
                        </div>
                      )}

                      {!canVote && votingState === 1 && isEligible && hasVoted && (
                        <div className="already-voted">Already Voted</div>
                      )}

                      {!canVote && votingState === 1 && !isEligible && (
                        <div className="not-eligible">Not Eligible</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Admin Panel */}
          {isAdmin && (
            <section className="admin-panel">
              <h2>Admin Controls</h2>

              {/* Voting Control Cards */}
              <div className="admin-grid">
                {votingState === 0 && (
                  <div className="admin-card">
                    <h3>Open Voting</h3>
                    <div className="admin-form">
                      <input
                        type="number"
                        min="1"
                        value={adminDuration}
                        onChange={(e) => setAdminDuration(e.target.value)}
                        placeholder="Duration in minutes"
                        className="input"
                        disabled={loading}
                      />
                      <button
                        className="btn btn-primary btn-block"
                        onClick={handleOpenVoting}
                        disabled={loading}
                      >
                        {loading ? 'Opening...' : 'Open Voting'}
                      </button>
                    </div>
                  </div>
                )}

                {votingState === 1 && (
                  <>
                    <div className="admin-card">
                      <h3>Pause Voting</h3>
                      <p className="admin-description">
                        Temporarily pause voting. Can be resumed later.
                      </p>
                      <button
                        className="btn btn-secondary btn-block"
                        onClick={handlePauseVoting}
                        disabled={loading}
                      >
                        {loading ? 'Pausing...' : 'Pause Voting'}
                      </button>
                    </div>

                    <div className="admin-card">
                      <h3>Close Voting</h3>
                      <p className="admin-description">
                        Stop voting permanently.
                      </p>
                      <button
                        className="btn btn-destructive btn-block"
                        onClick={handleCloseVoting}
                        disabled={loading}
                      >
                        {loading ? 'Closing...' : 'Close Voting'}
                      </button>
                    </div>
                  </>
                )}

                {votingState === 2 && (
                  <>
                    <div className="admin-card">
                      <h3>Resume Voting</h3>
                      <p className="admin-description">
                        Resume voting from pause.
                      </p>
                      <button
                        className="btn btn-primary btn-block"
                        onClick={handleResumeVoting}
                        disabled={loading}
                      >
                        {loading ? 'Resuming...' : 'Resume Voting'}
                      </button>
                    </div>

                    <div className="admin-card">
                      <h3>Close Voting</h3>
                      <p className="admin-description">
                        Stop voting permanently.
                      </p>
                      <button
                        className="btn btn-destructive btn-block"
                        onClick={handleCloseVoting}
                        disabled={loading}
                      >
                        {loading ? 'Closing...' : 'Close Voting'}
                      </button>
                    </div>
                  </>
                )}

                {votingState === 3 && (
                  <div className="admin-card">
                    <h3>Finalize Results</h3>
                    <p className="admin-description">
                      Lock results and announce winner.
                    </p>
                    <button
                      className="btn btn-primary btn-block"
                      onClick={handleFinalizeVoting}
                      disabled={loading}
                    >
                      {loading ? 'Finalizing...' : 'Finalize & Announce Winner'}
                    </button>
                  </div>
                )}

                {votingState === 4 && (
                  <div className="admin-card">
                    <h3>Voting Complete</h3>
                    <p className="admin-description">
                      Results have been finalized and locked.
                    </p>
                    <div className="finalized-badge">✓ Finalized</div>
                  </div>
                )}
              </div>

              {/* Admin Management Section */}
              {isOwner && (
                <div className="admin-section">
                  <h3>Manage Admins</h3>
                  <div className="admin-form">
                    <input
                      type="text"
                      value={newAdminAddress}
                      onChange={(e) => setNewAdminAddress(e.target.value)}
                      placeholder="Admin Ethereum Address (0x...)"
                      className={`input ${adminError ? 'input-error' : ''}`}
                      disabled={loading}
                    />
                    {adminError && <div className="error-message">{adminError}</div>}
                    <button
                      className="btn btn-primary btn-block"
                      onClick={handleAddAdmin}
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Admin'}
                    </button>
                  </div>

                  {admins.length > 0 && (
                    <div className="admins-list">
                      <h4>Current Admins ({admins.length})</h4>
                      <div className="admin-table">
                        {admins.map((admin, idx) => (
                          <div key={idx} className="admin-row">
                            <span className="mono">{formatAddress(admin)}</span>
                            {admin.toLowerCase() !== owner.toLowerCase() && (
                              <button
                                className="btn-remove"
                                onClick={() => handleRemoveAdmin(admin)}
                                title="Remove admin"
                                disabled={loading}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Eligible Voters Management */}
              <div className="admin-section">
                <h3>Manage Eligible Voters</h3>
                <p className="admin-description">
                  Registered voters: {registeredVoters.length} / 100
                </p>
                <div className="admin-form">
                  <input
                    type="text"
                    value={voterAddress}
                    onChange={(e) => setVoterAddress(e.target.value)}
                    placeholder="Voter Ethereum Address (0x...)"
                    className={`input ${addressError ? 'input-error' : ''}`}
                    disabled={loading}
                  />
                  {addressError && <div className="error-message">{addressError}</div>}

                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    placeholder="Voter ID (e.g., ID-001)"
                    className={`input ${voterError ? 'input-error' : ''}`}
                    disabled={loading}
                  />
                  {voterError && <div className="error-message">{voterError}</div>}

                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleAddEligibleVoter}
                    disabled={loading || registeredVoters.length >= 100}
                  >
                    {loading ? 'Adding...' : 'Add Eligible Voter'}
                  </button>
                </div>

                {registeredVoters.length > 0 ? (
                  <div className="voters-list">
                    <h4>Registered Voters ({registeredVoters.length})</h4>
                    <div className="voters-table">
                      <div className="voters-header">
                        <div className="col-address">Address</div>
                        <div className="col-id">Voter ID</div>
                        <div className="col-voted">Voted</div>
                        <div className="col-action">Action</div>
                      </div>
                      {registeredVoters.map((voter, idx) => (
                        <div key={idx} className="voters-row">
                          <div className="col-address">
                            <span className="mono">{formatAddress(voter.voterAddress)}</span>
                          </div>
                          <div className="col-id">{voter.voterId}</div>
                          <div className="col-voted">
                            {hasVoted[voter.voterAddress] ? '✓' : ''}
                          </div>
                          <div className="col-action">
                            <button
                              className="btn-remove"
                              onClick={() => handleRemoveVoter(voter.voterAddress)}
                              title="Remove voter"
                              disabled={loading || hasVoted[voter.voterAddress]}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="voters-list voters-list-empty">
                    <h4>Registered Voters (0)</h4>
                    <p>No eligible voters added yet. Use the form above to add voters.</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      ) : isConnected && wrongNetwork ? (
        <main className="main-content">
          <div className="error-container">
            <h2>Wrong Network</h2>
            <p>Please switch to Sepolia testnet to continue</p>
            <button className="btn btn-primary" onClick={switchNetwork}>
              Switch to Sepolia
            </button>
          </div>
        </main>
      ) : (
        <main className="main-content">
          <div className="error-container">
            <h2>Connect Your Wallet</h2>
            <p>Please connect MetaMask to participate in voting</p>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;