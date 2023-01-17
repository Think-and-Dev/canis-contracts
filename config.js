const config = {
    CanisNFT: {
        5: {
            cap: 5706,
            name: "CanisNFT",
            symbol: "CNFT",
            defaultFeeNumerator: 1000,
            startGiftingIndex: 1,
            endGiftingIndex: 150,
            contractUri: ""
        },
        43113: {
            cap: 5705,
            name: "CanisNFT",
            symbol: "CNFT",
            defaultFeeNumerator: 1000,
            startGiftingIndex: 1,
            endGiftingIndex: 150,
            contractUri: ""
        },
        31337: {
            cap: 10,
            name: "CanisNFT",
            symbol: "CNFT",
            defaultFeeNumerator: 1000,
            startGiftingIndex: 1,
            endGiftingIndex: 2,
            contractUri: ""
        },
        maxClaim: 3
    },
    Royalty: {
        5: {
            royaltyReceiver: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92'
        },
        43113: {
            royaltyReceiver: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92'
        },
        31337: {
            royaltyReceiver: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92'
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