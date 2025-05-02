# MyTravel.com – Blockchain-based Ticket Booking System

A decentralized travel ticket booking platform built using **Hyperledger Fabric**, enabling secure registration, listing, booking, and management of transport services. The system supports both **customers** and **transport providers**, offering a verifiable, tamper-resistant ledger for all interactions.

---

## 🏗️ Project Setup

This setup assumes you're using the standard `fabric-samples` directory structure.

### Step 1: Clean Previous Network Data

Navigate to the Fabric test network directory and remove any existing containers or credentials:

```bash
cd fabric-samples/test-network
./network.sh down



Step 2: Start Fabric Network with Channel and CouchDB
./network.sh up createChannel -c mychannel -ca -s couchdb
This command:

Launches Orderer and Peer nodes to handle transactions and blocks.
Starts Certificate Authorities (CAs) to issue cryptographic identities to participants.
Starts CouchDB for state storage with support for rich queries.
Creates a channel mychannel and joins both orgs to it.



Step 3: Deploy the Chaincode:
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript



Step 4: Start the Backend Server
In a new terminal:

cd fabric-samples/asset-transfer-basic/application-gateway-javascript/src
npm install
node routes_controllers.js


Step 5: Start the Frontend Client:
cd fabric-samples/mytravel-frontend
npm install
npm start








