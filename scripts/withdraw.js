const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
	const { deployer } = await getNamedAccounts();
	const fundMe = await ethers.getContract("FundMe", deployer);
	console.log("Withdraw...");
	const transactionResponse = await fundMe.cheaperWithdraw();

	await transactionResponse.wait(1);
	console.log("Withdrew!");
}
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
