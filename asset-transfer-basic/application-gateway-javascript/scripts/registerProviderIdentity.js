'use strict';

const { execSync } = require('child_process');
const path = require('path');

function runCommand(cmd, env) {
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
}

async function registerProviderIdentity({ email, password }) {
    const basePath = '/Users/sk6apple/Desktop/CS731_project/fabric-samples/test-network';
    const caClientPath = path.join(basePath, 'organizations/peerOrganizations/org1.example.com');
    const tlsCertPath = path.join(basePath, 'organizations/fabric-ca/org1/tls-cert.pem');
    const mspPath = path.join(caClientPath, `users/${email}/msp`);
    const configYamlSrc = path.join(caClientPath, 'msp/config.yaml');
    const configYamlDest = path.join(mspPath, 'config.yaml');

    const envVars = {
        PATH: `${path.join(basePath, '../bin')}:${basePath}:${process.env.PATH}`,
        FABRIC_CFG_PATH: path.join(basePath, '../config'),
        FABRIC_CA_CLIENT_HOME: caClientPath,
    };

    try {
        // Step 1: Register the user
        const registerCmd = `fabric-ca-client register --caname ca-org1 --id.name "${email}" --id.secret "${password}" --id.type client --tls.certfiles "${tlsCertPath}"`;
        runCommand(registerCmd, envVars);

        // Step 2: Enroll the user
        const enrollCmd = `fabric-ca-client enroll -u https://${email}:${password}@localhost:7054 --caname ca-org1 -M "${mspPath}" --tls.certfiles "${tlsCertPath}"`;
        runCommand(enrollCmd, envVars);

        // Step 3: Copy config.yaml
        const copyCmd = `cp "${configYamlSrc}" "${configYamlDest}"`;
        runCommand(copyCmd, envVars);
    } catch (err) {
        throw new Error(`CA registration/enrollment failed: ${err.message}`);
    }

    return {
        identity: email,
        mspPath
    };
}

module.exports = { registerProviderIdentity };
