const config = {
  CanisNFT: {
    1: {
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: '',
      assetToMint: 1000
    },
    5: {
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: '',
      assetToMint: 1000
    },
    43114: {
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: '',
      assetToMint: 111
    },
    43113: {
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: '',
      assetToMint: 111
    },
    31337: {
      cap: 10, //to some test modify to 11111
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: '',
      assetToMint: 10
    }
  },
  Royalty: {
    1: {
      royaltyReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageReceiver: 60,
      ubiReceiver: '', // if empty it will use the swapBurner
      percentageUBI: 40
    },
    5: {
      royaltyReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageReceiver: 60,
      ubiReceiver: '', // if empty it will use the swapBurner
      percentageUBI: 40
    },
    43114: {
      royaltyReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageReceiver: 60,
      ubiReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageUBI: 40
    },
    43113: {
      royaltyReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageReceiver: 60,
      ubiReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageUBI: 40
    },
    31337: {
      royaltyReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageReceiver: 60,
      ubiReceiver: '', // if empty it will use the swapBurner
      percentageUBI: 40
    }
  },
  SwapBurner: {
    1: {
      uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      ubiToken: '0xdd1ad9a21ce722c151a836373babe42c868ce9a4'
    },
    5: {
      uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      // use UNI instead as UBI does not exist on goerli
      ubiToken: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
    },
    31337: {
      uniswapRouter: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
      ubiToken: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92'
    }
  }
}

module.exports = config
