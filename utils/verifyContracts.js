const hre = require('hardhat')
const { ethers, run } = hre

const verifyContract = async (
    network,
    deployResult,
    contractName,
    constructorArguments,
) => {
    if (
        network.live &&
        deployResult.newlyDeployed &&
        deployResult.transactionHash
    ) {
        const blocks = 5;
        const address = deployResult.implementation || deployResult.address;
        const taskArgs = { address };

        if (constructorArguments) taskArgs.constructorArguments = constructorArguments;

        console.log(`Waiting ${blocks} blocks before verifying`);
        await ethers.provider.waitForTransaction(deployResult.transactionHash, blocks);
        try {
            console.log(`Startig Verification of ${contractName} ${address}`);
            await run('verify:verify', taskArgs);
        } catch (error) {
            if (error.message.includes('Already Verified')) {
                return;
            }
            throw error;
        }
    }
};

module.exports = {
    verifyContract
}