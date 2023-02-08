const config = {
    CanisNFT: {
        5: {
            cap: 11111,
            name: "CanisNFT",
            symbol: "CNFT",
            defaultFeeNumerator: 1000,
            startGiftingIndex: 1,
            endGiftingIndex: 150,
            contractUri: "",
            assetToMint: 3333
        },
        43113: {
            cap: 11111,
            name: "CanisNFT",
            symbol: "CNFT",
            defaultFeeNumerator: 1000,
            startGiftingIndex: 1,
            endGiftingIndex: 150,
            contractUri: "",
            assetToMint: 3333
        },
        31337: {
            cap: 11111, //to some test modify to 11111
            name: "CanisNFT",
            symbol: "CNFT",
            defaultFeeNumerator: 1000,
            startGiftingIndex: 1,
            endGiftingIndex: 2,
            contractUri: "",
            assetToMint: 3333
        },
        maxClaim: 0
    },
    Royalty: {
        5: {
            royaltyReceiver: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
            percentageReceiver: 60,
            percentageUBI: 40,
        },
        43113: {
            royaltyReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
            percentageReceiver: 60,
            percentageUBI: 40,
        },
        31337: {
            royaltyReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
            percentageReceiver: 60,
            percentageUBI: 40,
        },
    },
    SwapBurner: {
        5: {
            uniswapRouter: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
            ubiToken: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
            swapDeadline: 100,
        },
        43113: {
            uniswapRouter: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
            ubiToken: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
            swapDeadline: 100,
        },
        31337: {
            uniswapRouter: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
            ubiToken: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
            swapDeadline: 100,
        },
    }

}

module.exports = config