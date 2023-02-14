const config = {
  CanisNFT: {
    1: {
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: '',
      primarySalePrice: '150000000000000000', //0,15 ETH
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      assetToMint: 778
    },
    5: {
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      primarySalePrice: '150000000000000000', //0,15 ETH
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      contractUri: '',
      assetToMint: 778
    },
    43114: {
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: '',
      primarySalePrice: '1250000000000000000', //1,25 AVAX
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      assetToMint: 333
    },
    43113: {
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: '',
      primarySalePrice: '1250000000000000000', //1,25 AVAX
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      assetToMint: 333
    },
    31337: {
      cap: 10, //to some test modify to 11111
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      primarySalePrice: '100000000000000', //0,01 Local
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      contractUri: '',
      assetToMint: 10
    }
  },
  Royalty: {
    1: {
      royaltyReceiver: '0x0d42274878ca5f07B0420bBeBB56C3A66b83D63F',
      percentageReceiver: 50,
      ubiReceiver: '', // if empty it will use the swapBurner
      percentageUBI: 50
    },
    5: {
      royaltyReceiver: '0x0d42274878ca5f07B0420bBeBB56C3A66b83D63F',
      percentageReceiver: 50,
      ubiReceiver: '', // if empty it will use the swapBurner
      percentageUBI: 50
    },
    43114: {
      royaltyReceiver: '0x0d42274878ca5f07B0420bBeBB56C3A66b83D63F',
      percentageReceiver: 50,
      ubiReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageUBI: 50
    },
    43113: {
      royaltyReceiver: '0x0d42274878ca5f07B0420bBeBB56C3A66b83D63F',
      percentageReceiver: 50,
      ubiReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageUBI: 50
    },
    31337: {
      royaltyReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageReceiver: 50,
      ubiReceiver: '', // if empty it will use the swapBurner
      percentageUBI: 50
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
