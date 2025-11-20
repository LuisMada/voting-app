import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { ethers } from 'ethers';

// ============================================================
// CONTRACT CONFIG
// ============================================================
const CONTRACT_ADDRESS = '0x605E8e5B19975a344401dCB54658b15aE59259A6';
const SEPOLIA_CHAIN_ID = '11155111';

const CONTRACT_ABI = [
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
    inputs: [{ internalType: 'string', name: '_optionName', type: 'string' }],
    name: 'addOption',
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
    inputs: [{ internalType: 'string[]', name: '_optionNames', type: 'string[]' }],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'voterAddress', type: 'address' },
      { indexed: false, internalType: 'bytes32', name: 'voterIDHash', type: 'bytes32' }
    ],
    name: 'EligibleVoterAdded',
    type: 'event'
  },
  {
    inputs: [],
    name: 'finalizeVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_votingDurationSeconds', type: 'uint256' }],
    name: 'openVoting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'string', name: 'optionName', type: 'string' }],
    name: 'OptionAdded',
    type: 'event'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_optionId', type: 'uint256' }],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'optionId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' }
    ],
    name: 'VoteCast',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [],
    name: 'VotingClosed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [],
    name: 'VotingFinalized',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint256', name: 'votingDeadline', type: 'uint256' }],
    name: 'VotingOpened',
    type: 'event'
  },
  {
    inputs: [],
    name: 'currentState',
    outputs: [{ internalType: 'enum VotingContract.VotingState', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
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
    name: 'getOwner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
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
    inputs: [{ internalType: 'uint256', name: '_optionId', type: 'uint256' }],
    name: 'getVotesForOption',
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
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasVoted',
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
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'isEligible',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'options',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'uint256', name: 'voteCount', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalVotes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'voterIDHashToAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'votingDeadline',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const VOTING_STATES = {
  0: 'Idle',
  1: 'Open',
  2: 'Closed',
  3: 'Finalized'
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

  const [isOwner, setIsOwner] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [adminDuration, setAdminDuration] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [toast, setToast] = useState(null);
  const updateIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Utility Functions
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

  // Wallet Connection
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
      
      // Debug logging
      console.log('Connected Chain ID (hex):', chainId);
      console.log('Connected Chain ID (decimal):', chainIdDecimal);
      console.log('Expected Chain ID (decimal):', SEPOLIA_CHAIN_ID);
      console.log('SEPOLIA_CHAIN_ID value:', SEPOLIA_CHAIN_ID);
      console.log('typeof chainIdDecimal:', typeof chainIdDecimal);
      console.log('typeof SEPOLIA_CHAIN_ID:', typeof SEPOLIA_CHAIN_ID);
      console.log('Chain ID Match:', chainIdDecimal === parseInt(SEPOLIA_CHAIN_ID));

      if (chainIdDecimal !== parseInt(SEPOLIA_CHAIN_ID)) {
        setWrongNetwork(true);
        showToast('Please switch to Sepolia testnet', 'error');
        console.log('Wrong network - prompting to switch');
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
    setIsEligible(false);
    setHasVoted(false);
    showToast('Wallet disconnected', 'success');
  };

  // Contract Interactions
  const fetchContractState = async (contractInstance) => {
    try {
      if (!contractInstance) return;

      const state = await contractInstance.getVotingState();
      const stateNum = Number(state);
      console.log('Raw voting state from contract:', state);
      console.log('Voting state as number:', stateNum);
      console.log('VOTING_STATES:', { 0: 'Idle', 1: 'Open', 2: 'Closed', 3: 'Finalized' }[stateNum]);
      setVotingState(stateNum);

      const optionsCount = await contractInstance.getOptionsCount();
      const optionsData = [];
      for (let i = 0; i < optionsCount; i++) {
        const [name, voteCount] = await contractInstance.getOption(i);
        optionsData.push({ id: i, name, voteCount: Number(voteCount) });
      }
      setOptions(optionsData);

      const total = await contractInstance.getTotalVotes();
      setTotalVotes(Number(total));

      const deadline = await contractInstance.getVotingDeadline();
      setVotingDeadline(Number(deadline));

      const ownerAddress = await contractInstance.getOwner();
      setOwner(ownerAddress);

      if (account) {
        const eligible = await contractInstance.isAddressEligible(account);
        setIsEligible(eligible);
        console.log('Eligibility check for', account);
        console.log('Is eligible:', eligible);

        const voted = await contractInstance.hasAddressVoted(account);
        setHasVoted(voted);

        setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
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

  const [voterAddress, setVoterAddress] = useState('');
  const [voterId, setVoterId] = useState('');
  const [eligibleVoters, setEligibleVoters] = useState([]);

  // Load eligible voters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('eligibleVoters');
    if (saved) {
      try {
        setEligibleVoters(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved voters:', e);
      }
    }
  }, []);

  const saveEligibleVoter = (address, id) => {
    const updated = [...eligibleVoters];
    const exists = updated.findIndex(v => v.address.toLowerCase() === address.toLowerCase());
    
    if (exists === -1) {
      updated.push({ address, id, addedAt: new Date().toLocaleString() });
      setEligibleVoters(updated);
      localStorage.setItem('eligibleVoters', JSON.stringify(updated));
    }
  };

  const removeEligibleVoter = (address) => {
    const updated = eligibleVoters.filter(v => v.address.toLowerCase() !== address.toLowerCase());
    setEligibleVoters(updated);
    localStorage.setItem('eligibleVoters', JSON.stringify(updated));
  };

  const handleAddEligibleVoter = async () => {
    if (!voterAddress || !voterId) {
      showToast('Please enter both address and voter ID', 'error');
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.addEligibleVoter(voterAddress, voterId);
      const receipt = await tx.wait();

      // Save to local tracking
      saveEligibleVoter(voterAddress, voterId);

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

  // Effects
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
        // Refresh contract data when account changes
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
  }, []);

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
          <section className="user-status">
            <div className="status-grid">
              <div className={`status-card ${isOwner ? 'active' : ''}`}>
                <div className="status-label">Role</div>
                <div className="status-value">
                  {isOwner ? '👑 Owner' : '🗳️ Voter'}
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

          <section className="voting-status">
            <div className="status-box">
              <div className="status-header">
                <h2>Voting Status</h2>
                <div className="status-badge-large">
                  {votingState !== null ? VOTING_STATES[votingState] : 'Loading...'}
                </div>
              </div>

              <div className="status-details">
                <div className="detail-row">
                  <span>Total Votes Cast:</span>
                  <strong>{totalVotes}</strong>
                </div>

                {votingState === 1 && timeRemaining !== null && (
                  <div className="detail-row countdown">
                    <span>Time Remaining:</span>
                    <strong className="timer">
                      {formatTime(timeRemaining)}
                    </strong>
                  </div>
                )}

                {votingState === 1 && timeRemaining === 0 && (
                  <div className="detail-row">
                    <span>Status:</span>
                    <strong className="expired">Voting Period Expired</strong>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="voting-options">
            <h2>Voting Options</h2>
            <div className="options-grid">
              {options.map((option) => {
                const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
                const canVote =
                  votingState === 1 &&
                  isEligible &&
                  !hasVoted &&
                  timeRemaining > 0;
                
                console.log('Vote button conditions:', {
                  votingState,
                  'votingState === 1': votingState === 1,
                  isEligible,
                  hasVoted,
                  timeRemaining,
                  canVote,
                  option: option.name
                });

                return (
                  <div key={option.id} className="option-card">
                    <div className="option-header">
                      <h3>{option.name}</h3>
                      <div className="vote-count">{option.voteCount} votes</div>
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

          {isOwner && (
            <section className="admin-panel">
              <h2>Admin Controls</h2>
              
              {/* Eligible Voters Management */}
              <div className="admin-section">
                <h3>Manage Eligible Voters</h3>
                <div className="admin-form">
                  <input
                    type="text"
                    value={voterAddress}
                    onChange={(e) => setVoterAddress(e.target.value)}
                    placeholder="Voter Ethereum Address (0x...)"
                    className="input"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    placeholder="Voter ID (e.g., ID123)"
                    className="input"
                    disabled={loading}
                  />
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleAddEligibleVoter}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Eligible Voter'}
                  </button>
                </div>

                {/* Eligible Voters List */}
                {eligibleVoters.length > 0 ? (
                  <div className="voters-list">
                    <h4>Registered Eligible Voters ({eligibleVoters.length})</h4>
                    <div className="voters-table">
                      <div className="voters-header">
                        <div className="col-address">Address</div>
                        <div className="col-id">Voter ID</div>
                        <div className="col-date">Added</div>
                        <div className="col-action">Action</div>
                      </div>
                      {eligibleVoters.map((voter, idx) => (
                        <div key={idx} className="voters-row">
                          <div className="col-address">
                            <span className="mono">{formatAddress(voter.address)}</span>
                          </div>
                          <div className="col-id">{voter.id}</div>
                          <div className="col-date">{voter.addedAt}</div>
                          <div className="col-action">
                            <button
                              className="btn-remove"
                              onClick={() => removeEligibleVoter(voter.address)}
                              title="Remove from local list"
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
                    <h4>Registered Eligible Voters (0)</h4>
                    <p>No eligible voters added yet. Use the form above to add voters.</p>
                  </div>
                )}
              </div>

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

                {votingState === 1 && timeRemaining === 0 && (
                  <div className="admin-card">
                    <h3>Close Voting</h3>
                    <p className="admin-description">
                      Deadline has passed. Close voting to proceed.
                    </p>
                    <button
                      className="btn btn-secondary btn-block"
                      onClick={handleCloseVoting}
                      disabled={loading}
                    >
                      {loading ? 'Closing...' : 'Close Voting'}
                    </button>
                  </div>
                )}

                {votingState === 2 && (
                  <div className="admin-card">
                    <h3>Finalize Results</h3>
                    <p className="admin-description">
                      Voting is closed. Finalize to lock results.
                    </p>
                    <button
                      className="btn btn-primary btn-block"
                      onClick={handleFinalizeVoting}
                      disabled={loading}
                    >
                      {loading ? 'Finalizing...' : 'Finalize Results'}
                    </button>
                  </div>
                )}

                {votingState === 3 && (
                  <div className="admin-card">
                    <h3>Voting Complete</h3>
                    <p className="admin-description">
                      Results have been finalized and locked.
                    </p>
                    <div className="finalized-badge">✓ Finalized</div>
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