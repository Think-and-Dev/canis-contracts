const config = {
  CanisNFT: {
    1: {
      owner: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',// if empty it will use the deployer address
      minter: '0xE91Bb83Eb7Fe28E49fB49A8696409d08132405cB',
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: 'ipfs://bafybeihdkldxf6akp2e44bdb5dcof653vpjebvb3igk6holzx5ufnuvdzq/contract-level.json',
      primarySalePrice: '150000000000000000', //0,15 ETH
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      assetToMint: 778
    },
    5: {
      owner:'0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88', // if empty it will use the deployer address
      minter: '0xE91Bb83Eb7Fe28E49fB49A8696409d08132405cB',
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      primarySalePrice: '150000000000000000', //0,15 ETH
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      contractUri: 'ipfs://bafybeiell6jsgvp4tp5pfbfq3ttzjr27xwt6gnqat7ehsaok6mvunsdike/contract-level.json',
      assetToMint: 778
    },
    43114: {
      owner:'0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88', // if empty it will use the deployer address
      minter: '0xE91Bb83Eb7Fe28E49fB49A8696409d08132405cB',
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: 'ipfs://bafybeig7bbhddykavlpihbnzdqr777l5y4x2ppqnygcyzxxzfb6cdjztim/contract-level.json',
      primarySalePrice: '15000000000000000000', //15 AVAX
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      assetToMint: 333
    },
    43113: {
      owner:'0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88', // if empty it will use the deployer address
      minter: '0xE91Bb83Eb7Fe28E49fB49A8696409d08132405cB',
      cap: 11111,
      name: 'CanisNFT',
      symbol: 'CANIS',
      defaultFeeNumerator: 1000, //10%
      contractUri: 'ipfs://bafybeie7ce4wyjfarreu6rq4nko5s6n6aljbzgaggbub6griyjz3dswwtu/contract-level.json',
      primarySalePrice: '1250000000000000000', //1,25 AVAX
      primarySaleReceiverAddress: '0x07e28B3350bC6a0D421Bf5F6308a399F4c99Ce88',
      assetToMint: 333
    },
    31337: {
      owner:'', // if empty it will use the deployer address
      minter: '0x27598400A96D4EE85f86b0931e49cBc02adD6dF0',
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
      percentageReceiver: 100,
      ubiReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageUBI: 0
    },
    43113: {
      royaltyReceiver: '0x0d42274878ca5f07B0420bBeBB56C3A66b83D63F',
      percentageReceiver: 100,
      ubiReceiver: '0x48Ef3BDB04a636dafa080A4F96347D1A35Bfbf4e',
      percentageUBI: 0
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
      uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', //uniswap v2
      ubiToken: '0xdd1ad9a21ce722c151a836373babe42c868ce9a4'
    },
    5: {
      uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      // use UNI instead as UBI does not exist on goerli
      ubiToken: '0xCeb20ca274C9B8D8cE030d64ac5737bfF70ca7cB'
    },
    31337: {
      uniswapRouter: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92',
      ubiToken: '0x080D834838dc9EE7154a5d13E03073CA2ADd0C92'
    }
  }
}

module.exports = config
