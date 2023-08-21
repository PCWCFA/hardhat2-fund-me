const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", () => {
			let fundMe;
			let deployer;
			const sendValue = ethers.parseEther("0.001");
			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				fundMe = await ethers.getContract("FundMe", deployer);
			});

			it("ST1: Allows people to fund and withdraw", async () => {
				await fundMe.fund({ value: sendValue });
				await fundMe.withdraw();
				//const endingBalance = await fundMe.getBalance();
				const endingBalance = await ethers.provider.getBalance(fundMe.target);
				assert.equal(endingBalance.toString(), "0");
			});
	  });
