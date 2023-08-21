const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", () => {
			let fundMe, mockV3Aggregator, deployer;
			const sendValue = ethers.parseEther("1");
			beforeEach(async () => {
				// deploy using Hardhat deploy
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(["all"]);
				fundMe = await ethers.getContract("FundMe", deployer);
				mockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					deployer,
				);
			});

			describe("constructor", async () => {
				it("UT1: Sets the aggregator addresses correctly", async () => {
					const response = await fundMe.getPriceFeed();
					assert.equal(response, mockV3Aggregator.target);
				});
			});

			describe("Funding", async () => {
				it("UT2: Fails if not enough ETH is sent", async () => {
					await expect(fundMe.fund()).to.be.reverted;
				});

				it("UT3: Updates the amount funded data structure", async () => {
					await fundMe.fund({ value: sendValue });
					const response = await fundMe.getAddressToAmountFunded(deployer);
					assert.equal(response.toString(), sendValue.toString());
				});
				it("UT4: Adds funders to the array of funders", async () => {
					await fundMe.fund({ value: sendValue });
					const response = await fundMe.getFunder(0);
					assert.equal(response.toString(), deployer);
				});
			});

			describe("Withdraw", async () => {
				beforeEach(async () => {
					await fundMe.fund({ value: sendValue });
				});

				it("UT5: Withdraw ETH from a single funder", async () => {
					const startingFundMeBalance = await ethers.provider.getBalance(
						fundMe.target,
					);

					const startingDeployerBalance = await ethers.provider.getBalance(
						deployer,
					);

					const response = await fundMe.withdraw();
					const receipt = await response.wait(1);

					const endingFundMeBalance = await ethers.provider.getBalance(
						fundMe.target,
					);
					const endingDeployerBalance = await ethers.provider.getBalance(
						deployer,
					);

					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						(startingDeployerBalance + startingFundMeBalance).toString(),
						(endingDeployerBalance + receipt.fee).toString(),
					);
				});

				it("UT6: Withdraw with multiple funders", async () => {
					const accounts = await ethers.getSigners();
					for (let i = 1; i < 6; i++) {
						const fundMeConnctedContract = await fundMe.connect(accounts[i]);
						await fundMeConnctedContract.fund({ value: sendValue });
					}

					const startingFundMeBalance = await ethers.provider.getBalance(
						fundMe.target,
					);
					const startingDeployerBalance = await ethers.provider.getBalance(
						deployer,
					);

					const response = await fundMe.withdraw();
					const receipt = await response.wait(1);

					const endingFundMeBalance = await ethers.provider.getBalance(
						fundMe.target,
					);
					const endingDeployerBalance = await ethers.provider.getBalance(
						deployer,
					);

					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						(startingDeployerBalance + startingFundMeBalance).toString(),
						(endingDeployerBalance + receipt.fee).toString(),
					);

					for (let i = 1; i < 6; i++) {
						assert.equal(await fundMe.getAddressToAmountFunded(accounts[i]), 0);
					}
				});

				it("UT7: Only the owner can withdraw", async () => {
					const accounts = await ethers.getSigners();
					//console.log(`accounts ${accounts}`);
					const attackerConnectedContract = await fundMe.connect(accounts[1]);
					console.log(
						`attackerConnectedContract: ${attackerConnectedContract}`,
					);

					await expect(attackerConnectedContract.withdraw()).to.be.reverted;
				});

				it("UT8: cheaperWithdraw ETH from a single funder", async () => {
					const startingFundMeBalance = await ethers.provider.getBalance(
						fundMe.target,
					);

					const startingDeployerBalance = await ethers.provider.getBalance(
						deployer,
					);

					const response = await fundMe.cheaperWithdraw();
					const receipt = await response.wait(1);

					const endingFundMeBalance = await ethers.provider.getBalance(
						fundMe.target,
					);
					const endingDeployerBalance = await ethers.provider.getBalance(
						deployer,
					);

					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						(startingDeployerBalance + startingFundMeBalance).toString(),
						(endingDeployerBalance + receipt.fee).toString(),
					);
				});

				it("UT9: cheaperWithdraw with multiple funders", async () => {
					const accounts = await ethers.getSigners();
					for (let i = 1; i < 6; i++) {
						const fundMeConnctedContract = await fundMe.connect(accounts[i]);
						await fundMeConnctedContract.fund({ value: sendValue });
					}

					const startingFundMeBalance = await ethers.provider.getBalance(
						fundMe.target,
					);
					const startingDeployerBalance = await ethers.provider.getBalance(
						deployer,
					);

					const response = await fundMe.cheaperWithdraw();
					const receipt = await response.wait(1);

					const endingFundMeBalance = await ethers.provider.getBalance(
						fundMe.target,
					);
					const endingDeployerBalance = await ethers.provider.getBalance(
						deployer,
					);

					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						(startingDeployerBalance + startingFundMeBalance).toString(),
						(endingDeployerBalance + receipt.fee).toString(),
					);

					for (let i = 1; i < 6; i++) {
						assert.equal(await fundMe.getAddressToAmountFunded(accounts[i]), 0);
					}
				});
			});
	  });
