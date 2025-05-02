/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

//DO NOT MODIFY!!!!
const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { TextDecoder } = require('node:util');

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault(
    'CRYPTO_PATH',
    path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'test-network',
        'organizations',
        'peerOrganizations',
        'org1.example.com'
    )
);

// Path to user private key directory.
const keyDirectoryPath = envOrDefault(
    'KEY_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    )
);

// Path to user certificate directory.
const certDirectoryPath = envOrDefault(
    'CERT_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts'
    )
);

// Path to peer tls certificate.
const tlsCertPath = envOrDefault(
    'TLS_CERT_PATH',
    path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')
);

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
const assetId = `asset${String(Date.now())}`;   //I GUESS THIS WON'T BE REQUIRED.

var contract;

async function main() {
    displayInputParameters();   //I GUESS THIS WON'T BE REQUIRED

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        hash: hash.sha256,
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    // try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        contract = network.getContract(chaincodeName);

        // //MAKE CHANGES HERE!!!!
        // // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
        // await initLedger(contract);

        // await registerProvider(contract, 'Redbus Pvt Ltd', 'support@redbus.in', '9876543210');
        // await registerProvider(contract, 'Arkids', 'support@arkids.in', '9876543210');

        // await updateProvider(contract, 'Redbus Limited', 'help@redbus.in', '9998887776');

        // // await deleteProvider(contract);

        // await addModeOfTransport(contract, 'Bus');

        // await removeModeOfTransport(contract, 'Train');

        // await addTransportOption(
        //     contract,
        //     'Bus',
        //     'Delhi',
        //     'Kanpur',
        //     '2025-05-02T10:00:00Z',
        //     '2025-05-02T18:00:00Z',
        //     '1200',
        //     '40'
        // );

        // await removeTransportOption(contract, 'TRANS_1714551590041_a83b22');

        // await queryProviderTransportOptions(contract, 'Delhi', 'Kanpur');



    // } finally {
    //     gateway.close();
    //     client.close();
    // }
}

main().catch((error) => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});



// === ROUTE FUNCTIONS ===

async function initLedger_route() {
    return await initLedger(contract);
}

async function registerProvider_route(companyName, contactEmail, contactPhone, password) {
    hashed_password = hashPassword(password);
    return await registerProvider(contract, companyName, contactEmail, contactPhone, hashed_password);
}
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex'); // 16 bytes = 128 bits
    const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
    return `${salt}:${hash}`;
}



async function loginProvider_route(contactEmail, password) {
    const storedHashedPassword = await loginProvider(contract, contactEmail, password);
    
    const match = matchPassword(password, storedHashedPassword);
    if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
    }
    // res.json({ success: true, message: 'Login successful', providerId });
    const providerId = crypto.createHash('sha256')
        .update(contactEmail.toLowerCase().trim())
        .digest('hex');

    return { success: true, message: 'Login successful', providerId };
}
function matchPassword(inputPassword, storedHash) {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.createHash('sha256').update(salt + inputPassword).digest('hex');
    return hash === originalHash;
}



async function updateProvider_route(companyName, contactEmail, contactPhone) {
    return await updateProvider(contract, companyName, contactEmail, contactPhone);
}

async function deleteProvider_route() {
    return await deleteProvider(contract);
}

async function addModeOfTransport_route(mode) {
    return await addModeOfTransport(contract, mode);
}

async function removeModeOfTransport_route(mode) {
    return await removeModeOfTransport(contract, mode);
}

async function addTransportOption_route(mode, source, destination, departure, arrival, price, seats) {
    return await addTransportOption(contract, mode, source, destination, departure, arrival, price, seats);
}

async function removeTransportOption_route(transportId) {
    return await removeTransportOption(contract, transportId);
}

async function queryProviderTransportOptions_route(source, destination) {
    return await queryProviderTransportOptions(contract, source, destination);
}




async function initLedger(contract) {
    await contract.submitTransaction('initLedger');
}



async function registerProvider(contract, companyName, contactEmail, contactPhone, hashed_password) {
    console.log('\n--> Submit Transaction: registerProvider');

    const commit = await contract.submitAsync('registerProvider', {
        arguments: [companyName, contactEmail, contactPhone, hashed_password],
    });

    const resultJson = utf8Decoder.decode(commit.getResult());
    console.log('*** Provider Registered:', JSON.parse(resultJson));

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed: ${status.code}`);
    }
    console.log('*** Transaction committed successfully');
}


async function loginProvider(contract, contactEmail, password){
    console.log('\n--> Evaluate Transaction: loginProvider');

    const resultBytes = await contract.evaluateTransaction('loginProvider', contactEmail);
    const hashedPassword = utf8Decoder.decode(resultBytes);

    console.log('*** Retrieved hashed password from chaincode');
    return hashedPassword;
}
// async function loginProvider(contract, contactEmail, password) {
//     const resultBytes = await contract.evaluateTransaction('loginProvider', contactEmail, password);

//     const hashedPassword = utf8Decoder.decode(resultBytes);

//     // Ensure result is a string (strip quotes if needed)
//     const clean = hashedPassword.replace(/^"(.*)"$/, '$1');

//     return clean;
// }



async function updateProvider(contract, companyName, contactEmail, contactPhone) {
    console.log('\n--> Submit Transaction: updateProvider');

    const commit = await contract.submitAsync('updateProvider', {
        arguments: [companyName, contactEmail, contactPhone],
    });

    const resultJson = utf8Decoder.decode(commit.getResult());
    console.log('*** Provider Updated:', JSON.parse(resultJson));

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed: ${status.code}`);
    }
    console.log('*** Transaction committed successfully');
}



async function deleteProvider(contract) {
    console.log('\n--> Submit Transaction: deleteProvider');

    const commit = await contract.submitAsync('deleteProvider');
    const result = utf8Decoder.decode(commit.getResult());
    console.log('*** Provider Deleted:', result);

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed: ${status.code}`);
    }
    console.log('*** Transaction committed successfully');
}



async function addModeOfTransport(contract, mode) {
    console.log('\n--> Submit Transaction: addModeOfTransport');

    const commit = await contract.submitAsync('addModeOfTransport', {
        arguments: [mode],
    });

    const resultJson = utf8Decoder.decode(commit.getResult());
    console.log('*** Updated Modes of Transport:', JSON.parse(resultJson));

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed: ${status.code}`);
    }
    console.log('*** Transaction committed successfully');
}



async function removeModeOfTransport(contract, mode) {
    console.log('\n--> Submit Transaction: removeModeOfTransport');

    const commit = await contract.submitAsync('removeModeOfTransport', {
        arguments: [mode],
    });

    const resultJson = utf8Decoder.decode(commit.getResult());
    console.log('*** Updated Modes after Removal:', JSON.parse(resultJson));

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed: ${status.code}`);
    }
    console.log('*** Transaction committed successfully');
}



async function addTransportOption(contract, mode, source, destination, departure, arrival, price, seats) {
    const timestamp = new Date().getTime();
    const randomString = crypto.randomBytes(3).toString('hex');
    transportId = `TRANS_${timestamp}_${randomString}`;
    // transportId = 1001

    console.log('\n--> Submit Transaction: addTransportOption');

    const commit = await contract.submitAsync('addTransportOption', {
        arguments: [transportId, mode, source, destination, departure, arrival, price.toString(), seats.toString()],
    });

    const resultJson = utf8Decoder.decode(commit.getResult());
    console.log('*** Transport Option Added:', JSON.parse(resultJson));

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed: ${status.code}`);
    }
    console.log('*** Transaction committed successfully');
}



async function removeTransportOption(contract, transportId) {
    console.log('\n--> Submit Transaction: removeTransportOption');

    const commit = await contract.submitAsync('removeTransportOption', {
        arguments: [transportId],
    });

    const result = utf8Decoder.decode(commit.getResult());
    console.log('*** Transport Option Removed:', result);

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed: ${status.code}`);
    }
    console.log('*** Transaction committed successfully');
}



async function queryProviderTransportOptions(contract, source, destination) {
    console.log('\n--> Evaluate Transaction: queryProviderTransportOptions');

    const resultBytes = await contract.evaluateTransaction('queryProviderTransportOptions', source, destination);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);

    // console.log('*** Provider Transport Options:', result);
    if (Array.isArray(result) && result.length === 0) {
        console.log('*** No transport options available for the given source and destination.');
    } else {
        console.log('*** Provider Transport Options:', result);
        return result;
    }
}



//DO NOT MODIFY!!!!
async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

//DO NOT MODIFY!!!!
async function newIdentity() {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

//DO NOT MODIFY!!!!
async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

//DO NOT MODIFY!!!!
async function newSigner() {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}



/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
function displayInputParameters() {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${certDirectoryPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}



module.exports = {
    initLedger_route,
    registerProvider_route,
    loginProvider_route,
    updateProvider_route,
    deleteProvider_route,
    addModeOfTransport_route,
    removeModeOfTransport_route,
    addTransportOption_route,
    removeTransportOption_route,
    queryProviderTransportOptions_route
};
