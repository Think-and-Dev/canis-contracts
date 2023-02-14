// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUniswapRouter is Ownable {
    using SafeERC20 for IERC20;
    address private WETHToken;
    address public UBIToken;
    uint256 public mulFactor;

    constructor(
        address _weth,
        address _ubiToken,
        uint256 _mulFactor
    ) {
        require(_weth != address(0), "WETH ADDRESS CANNOT BE ZERO");
        WETHToken = _weth;
        UBIToken = _ubiToken;
        mulFactor = _mulFactor;
    }

    function setMulFactor(uint256 _mulFactor) public onlyOwner {
        mulFactor = _mulFactor;
    }

    function WETH() public view returns (address) {
        return WETHToken;
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountsOut(uint256 amountIn, address[] memory path) public returns (uint256[] memory amounts) {
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        amounts[1] = 0;
    }

    function swapETHForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts) {
        require(IERC20(UBIToken).balanceOf(address(this)) > 0, "NO MORE UBIS LEFT TO GIVE");
         require(deadline >= block.timestamp, "DEADLINE EXPIRED");
        IERC20(UBIToken).transfer(msg.sender, amountOut / mulFactor);
        (bool sent, ) = payable(msg.sender).call{value: (msg.value) - 10}("");
        require(sent, "Failed to send Native currency dust");
        amounts = new uint256[](path.length);
    }
}
