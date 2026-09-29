# Certificate Verification System

A blockchain-based certificate verification system built with Solidity, JavaScript and MetaMask. It allows a university to issue certificates on the Ethereum blockchain and lets anyone verify whether a certificate is genuine.

## Features
- Issue certificates on the blockchain (admin only)
- Verify a certificate using its hash
- Revoke certificates when needed
- Tamper-proof, transparent records

## Technologies Used
- Solidity (smart contract)
- Remix IDE
- MetaMask
- Ethereum Sepolia test network
- HTML and JavaScript (web3 / ethers)

## Project Structure
- `CertificateRegistry.sol` - smart contract
- `index.html` - user interface
- `app.js` - connects the interface to the smart contract

## How It Works
1. The university admin deploys the `CertificateRegistry` contract.
2. The admin issues a certificate (student ID, course name), which is stored against a unique hash.
3. Anyone can enter the certificate hash on the website to check if it is valid.
4. If a certificate is revoked, it is marked as invalid.

## How to Run
1. Open `CertificateRegistry.sol` in Remix IDE and compile it.
2. Deploy it using MetaMask on the Sepolia network.
3. Put the deployed contract address in `app.js`.
4. Open `index.html` in your browser and connect MetaMask.

## Team Members
- Tharushi Imasha
- (add other members here)
