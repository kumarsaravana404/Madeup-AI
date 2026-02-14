# Decentralized Identity Systems

## Overview

Decentralized Identifiers (DIDs) are a new type of identifier that enables verifiable, self-sovereign digital identity. Unlike traditional identifiers (email, username, SSN), DIDs are:

- **Decentralized**: No central authority controls them
- **Persistent**: They remain valid indefinitely
- **Cryptographically Verifiable**: Ownership can be proven
- **Resolvable**: Can be looked up to retrieve associated data

## Core Concepts

### 1. DID Structure

A DID follows this format:

```
did:method:identifier
```

Example:

```
did:ethr:0x1234567890abcdef1234567890abcdef12345678
did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH
```

### 2. DID Document

A DID Document contains:

- **Public Keys**: For authentication and encryption
- **Service Endpoints**: URLs for interaction
- **Authentication Methods**: How to prove control
- **Verification Methods**: Cryptographic proof mechanisms

Example DID Document:

```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:example:123456789abcdefghi",
  "authentication": [
    {
      "id": "did:example:123456789abcdefghi#keys-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:example:123456789abcdefghi",
      "publicKeyMultibase": "zH3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV"
    }
  ],
  "service": [
    {
      "id": "did:example:123456789abcdefghi#vcs",
      "type": "VerifiableCredentialService",
      "serviceEndpoint": "https://example.com/vc/"
    }
  ]
}
```

## Verifiable Credentials

### Structure

Verifiable Credentials (VCs) are tamper-evident credentials that can be cryptographically verified.

Components:

1. **Issuer**: Entity that creates the credential
2. **Subject**: Entity the credential is about
3. **Claims**: Statements about the subject
4. **Proof**: Cryptographic signature

Example:

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": ["VerifiableCredential", "UniversityDegreeCredential"],
  "issuer": "did:example:university",
  "issuanceDate": "2024-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:example:student123",
    "degree": {
      "type": "BachelorDegree",
      "name": "Bachelor of Science in Computer Science"
    }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2024-01-01T00:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:example:university#key-1",
    "proofValue": "z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGesjuTSwRdoWhAfGFCF5bppETSTojQCrfFPP2oumHKtz"
  }
}
```

## Zero-Knowledge Proofs in Identity

### Concept

Zero-Knowledge Proofs (ZKPs) allow proving a statement is true without revealing the underlying data.

### Use Cases in Identity

1. **Age Verification**: Prove you're over 18 without revealing exact age
2. **Credential Verification**: Prove you have a degree without showing the degree
3. **Selective Disclosure**: Share only necessary attributes

### Example: zk-SNARKs for Age Verification

```solidity
// Simplified Solidity example
contract AgeVerifier {
    function verifyAge(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public view returns (bool) {
        // Verify zk-SNARK proof that age > 18
        // without revealing actual age
        return verifyProof(a, b, c, input);
    }
}
```

## Implementation Patterns

### 1. DID Registration on Ethereum

```javascript
// Using ethers.js
const { ethers } = require("ethers");

async function registerDID(privateKey, didDocument) {
  const provider = new ethers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/YOUR_KEY",
  );
  const wallet = new ethers.Wallet(privateKey, provider);

  // DID Registry contract
  const registryAddress = "0x...";
  const registry = new ethers.Contract(registryAddress, ABI, wallet);

  // Register DID
  const tx = await registry.setAttribute(
    wallet.address,
    "did/pub/Ed25519/veriKey/base64",
    didDocument.publicKey,
    86400, // validity period
  );

  await tx.wait();
  return `did:ethr:${wallet.address}`;
}
```

### 2. Verifiable Credential Issuance

```javascript
const {
  Ed25519VerificationKey2020,
} = require("@digitalbazaar/ed25519-verification-key-2020");
const {
  Ed25519Signature2020,
} = require("@digitalbazaar/ed25519-signature-2020");

async function issueCredential(issuerDID, subjectDID, claims) {
  const credential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential"],
    issuer: issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: subjectDID,
      ...claims,
    },
  };

  // Sign credential
  const suite = new Ed25519Signature2020({ key: issuerKey });
  const signedCredential = await suite.sign({
    document: credential,
    purpose: new AssertionProofPurpose(),
  });

  return signedCredential;
}
```

## Security Considerations

### 1. Key Management

- **Never store private keys in plaintext**
- Use hardware wallets for high-value identities
- Implement key rotation mechanisms
- Use hierarchical deterministic (HD) wallets

### 2. Privacy Protection

- Minimize data exposure through selective disclosure
- Use pairwise DIDs for different relationships
- Implement correlation resistance
- Use zero-knowledge proofs where possible

### 3. Revocation

- Implement credential revocation lists
- Use status list 2021 specification
- Consider privacy implications of revocation checks

### 4. Recovery Mechanisms

- Social recovery (trusted contacts)
- Multi-signature schemes
- Time-locked recovery
- Backup phrases (BIP-39)

## Standards and Specifications

### W3C Standards

- **DID Core**: https://www.w3.org/TR/did-core/
- **Verifiable Credentials**: https://www.w3.org/TR/vc-data-model/
- **DID Resolution**: https://w3c-ccg.github.io/did-resolution/

### DID Methods

- **did:ethr**: Ethereum-based DIDs
- **did:key**: Self-contained cryptographic keys
- **did:web**: Web-based DIDs
- **did:ion**: Bitcoin-anchored DIDs (Microsoft)

## Best Practices

1. **Use established DID methods** for production systems
2. **Implement proper key rotation** to maintain security
3. **Design for privacy** from the start
4. **Use standard credential schemas** for interoperability
5. **Implement revocation mechanisms** before issuance
6. **Test thoroughly** with different wallets and verifiers
7. **Document your implementation** for auditors
8. **Plan for upgrades** as standards evolve

## Resources

- W3C DID Working Group: https://www.w3.org/2019/did-wg/
- Decentralized Identity Foundation: https://identity.foundation/
- Hyperledger Indy: https://www.hyperledger.org/use/hyperledger-indy
- uPort: https://www.uport.me/
- Sovrin Network: https://sovrin.org/

---

# Smart Contract Security

## Overview

Smart contracts are immutable programs on blockchain networks. Security vulnerabilities can lead to permanent loss of funds. This guide covers common vulnerabilities and prevention strategies.

## Common Vulnerabilities

### 1. Reentrancy Attacks

**Description**: Attacker recursively calls a function before the first invocation completes.

**Vulnerable Code**:

```solidity
contract Vulnerable {
    mapping(address => uint) public balances;

    function withdraw() public {
        uint amount = balances[msg.sender];
        // VULNERABLE: External call before state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] = 0;
    }
}
```

**Secure Code**:

```solidity
contract Secure {
    mapping(address => uint) public balances;

    function withdraw() public {
        uint amount = balances[msg.sender];
        // SECURE: Update state before external call
        balances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
    }
}
```

**Prevention**:

- Use Checks-Effects-Interactions pattern
- Update state before external calls
- Use ReentrancyGuard from OpenZeppelin

### 2. Integer Overflow/Underflow

**Vulnerable Code** (Solidity < 0.8.0):

```solidity
function add(uint256 a, uint256 b) public pure returns (uint256) {
    return a + b; // Can overflow
}
```

**Secure Code**:

```solidity
// Solidity >= 0.8.0 has built-in overflow checks
function add(uint256 a, uint256 b) public pure returns (uint256) {
    return a + b; // Safe in 0.8.0+
}

// Or use SafeMath for older versions
using SafeMath for uint256;
function add(uint256 a, uint256 b) public pure returns (uint256) {
    return a.add(b);
}
```

### 3. Access Control Issues

**Vulnerable Code**:

```solidity
contract Vulnerable {
    address public owner;

    function changeOwner(address newOwner) public {
        // VULNERABLE: No access control
        owner = newOwner;
    }
}
```

**Secure Code**:

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract Secure is Ownable {
    function changeOwner(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }
}
```

### 4. Front-Running

**Description**: Attackers observe pending transactions and submit their own with higher gas to execute first.

**Mitigation**:

```solidity
contract SecureAuction {
    mapping(bytes32 => bool) public commitments;

    // Commit-reveal scheme
    function commit(bytes32 hash) public {
        commitments[hash] = true;
    }

    function reveal(uint256 bid, bytes32 secret) public {
        bytes32 hash = keccak256(abi.encodePacked(bid, secret));
        require(commitments[hash], "Invalid commitment");
        // Process bid
    }
}
```

### 5. Delegatecall Vulnerabilities

**Vulnerable Code**:

```solidity
contract Vulnerable {
    address public owner;

    function delegateCall(address target, bytes memory data) public {
        // DANGEROUS: Can modify storage
        target.delegatecall(data);
    }
}
```

**Secure Code**:

```solidity
contract Secure {
    address public owner;
    address public immutable allowedLibrary;

    constructor(address _library) {
        allowedLibrary = _library;
    }

    function delegateCall(bytes memory data) public {
        // Only delegate to trusted library
        allowedLibrary.delegatecall(data);
    }
}
```

## Security Best Practices

### 1. Input Validation

```solidity
contract SecureContract {
    function transfer(address to, uint256 amount) public {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be positive");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
```

### 2. Use Modifiers for Access Control

```solidity
contract AccessControlled {
    address public owner;
    mapping(address => bool) public admins;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not admin");
        _;
    }

    function criticalFunction() public onlyOwner {
        // Only owner can call
    }
}
```

### 3. Emergency Stop (Circuit Breaker)

```solidity
contract EmergencyStop {
    bool public stopped = false;
    address public owner;

    modifier stopInEmergency() {
        require(!stopped, "Contract is stopped");
        _;
    }

    modifier onlyInEmergency() {
        require(stopped, "Not in emergency");
        _;
    }

    function toggleEmergencyStop() public onlyOwner {
        stopped = !stopped;
    }

    function deposit() public payable stopInEmergency {
        // Normal operation
    }

    function emergencyWithdraw() public onlyInEmergency {
        // Emergency withdrawal
    }
}
```

### 4. Rate Limiting

```solidity
contract RateLimited {
    mapping(address => uint256) public lastAction;
    uint256 public constant COOLDOWN = 1 hours;

    modifier rateLimit() {
        require(
            block.timestamp >= lastAction[msg.sender] + COOLDOWN,
            "Action too frequent"
        );
        lastAction[msg.sender] = block.timestamp;
        _;
    }

    function sensitiveAction() public rateLimit {
        // Rate-limited function
    }
}
```

### 5. Pull Over Push Payments

**Vulnerable (Push)**:

```solidity
function distributeRewards(address[] memory recipients) public {
    for (uint i = 0; i < recipients.length; i++) {
        // RISKY: One failure stops all transfers
        payable(recipients[i]).transfer(reward);
    }
}
```

**Secure (Pull)**:

```solidity
mapping(address => uint256) public pendingWithdrawals;

function withdraw() public {
    uint256 amount = pendingWithdrawals[msg.sender];
    pendingWithdrawals[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
}
```

## Testing and Auditing

### 1. Unit Testing with Hardhat

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureContract", function () {
  it("Should prevent reentrancy", async function () {
    const Contract = await ethers.getContractFactory("SecureContract");
    const contract = await Contract.deploy();

    const Attacker = await ethers.getContractFactory("ReentrancyAttacker");
    const attacker = await Attacker.deploy(contract.address);

    await expect(attacker.attack()).to.be.revertedWith(
      "ReentrancyGuard: reentrant call",
    );
  });
});
```

### 2. Static Analysis Tools

- **Slither**: Automated vulnerability detection
- **Mythril**: Security analysis tool
- **Securify**: Formal verification
- **MythX**: Comprehensive security analysis

### 3. Formal Verification

```solidity
// Specify invariants
/// @notice Balance should never decrease without withdrawal
/// @dev Formal verification property
contract VerifiedContract {
    mapping(address => uint256) public balances;

    /// @custom:invariant balances[addr] >= 0
    /// @custom:invariant totalSupply == sum(balances)
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
```

## Gas Optimization (Security Impact)

### 1. Avoid Unbounded Loops

**Vulnerable**:

```solidity
function processAll(address[] memory users) public {
    // RISKY: Can run out of gas
    for (uint i = 0; i < users.length; i++) {
        process(users[i]);
    }
}
```

**Secure**:

```solidity
function processBatch(address[] memory users, uint256 start, uint256 end) public {
    require(end <= users.length && end - start <= 100, "Batch too large");
    for (uint i = start; i < end; i++) {
        process(users[i]);
    }
}
```

### 2. Use Events for Data Storage

```solidity
// Expensive: Store in state
mapping(uint256 => Transaction) public transactions;

// Cheaper: Emit events
event TransactionRecorded(uint256 indexed id, address from, address to, uint256 amount);

function recordTransaction(uint256 id, address to, uint256 amount) public {
    emit TransactionRecorded(id, msg.sender, to, amount);
}
```

## Upgrade Patterns

### 1. Proxy Pattern (UUPS)

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyContract is UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function initialize() public initializer {
        __UUPSUpgradeable_init();
    }
}
```

### 2. Data Separation

```solidity
// Storage contract
contract Storage {
    mapping(address => uint256) public balances;
}

// Logic contract
contract Logic {
    Storage public storageContract;

    function updateBalance(address user, uint256 amount) public {
        storageContract.balances(user) = amount;
    }
}
```

## Security Checklist

- [ ] Use latest Solidity version (0.8.x+)
- [ ] Implement ReentrancyGuard on external calls
- [ ] Validate all inputs
- [ ] Use SafeMath or Solidity 0.8+ for arithmetic
- [ ] Implement access control (Ownable, AccessControl)
- [ ] Add emergency stop mechanism
- [ ] Use pull over push for payments
- [ ] Avoid delegatecall to untrusted contracts
- [ ] Implement rate limiting for sensitive functions
- [ ] Test with 100% code coverage
- [ ] Run static analysis tools (Slither, Mythril)
- [ ] Get professional audit before mainnet
- [ ] Monitor contract after deployment
- [ ] Have incident response plan
- [ ] Document all security assumptions

## Resources

- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/
- ConsenSys Smart Contract Best Practices: https://consensys.github.io/smart-contract-best-practices/
- SWC Registry (Weakness Classification): https://swcregistry.io/
- Ethernaut (Security Challenges): https://ethernaut.openzeppelin.com/
