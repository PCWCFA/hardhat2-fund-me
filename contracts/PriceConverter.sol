// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Why is this a library and not abstract?
// Why not an interface?
library PriceConverter {
	// We could make this public, but then we'd have to deploy it
	function getPrice(
		AggregatorV3Interface priceFeedAddress
	) internal view returns (uint256) {
		// https://docs.chain.link/docs/ethereum-addresses/
		AggregatorV3Interface priceFeed = AggregatorV3Interface(
			// Goerli
			priceFeedAddress
		);
		(, int256 answer, , , ) = priceFeed.latestRoundData();
		// ETH/USD rate in 18 digit
		return uint256(answer * 1e10);
	}

	// 1000000000
	function getConversionRate(
		uint256 ethAmount,
		AggregatorV3Interface priceFeed
	) internal view returns (uint256) {
		uint256 ethPrice = getPrice(priceFeed);
		uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
		// the actual ETH/USD conversation rate, after adjusting the extra 0s.
		return ethAmountInUsd;
	}
}
