const { network } = require("hardhat");
const {
	networkConfig,
	developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify.js");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;
	let ethUsdPriceFeedAddress;
	if (developmentChains.includes(network.name)) {
		const etheUsdAgggegator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = etheUsdAgggegator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	//console.log(`ethUSDPriceFeedAddress: ${ethUsdPriceFeedAddress}`);

	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: [ethUsdPriceFeedAddress],
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});
	log("FundMe deployed.");
	log("----------------------------------");

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(await fundMe.address, [ethUsdPriceFeedAddress]);
	}
};

module.exports.tags = ["all", "fundme"];
