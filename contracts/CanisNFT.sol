// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Canis NFT contract
/// @author Think and Dev
contract CanisNFT is ERC721URIStorage, ERC2981, Ownable {
    /// @dev Max amount of NFTs to be minted
    uint256 public immutable CAP;
    /// @dev Start index of nfts which will be gifted
    uint256 public startGiftingIndex;
    /// @dev End index where gifting ends
    uint256 public endGiftingIndex;
    /// @dev End index where gifting ends
    uint256 public maxClaim = 0;
    /// @dev ContractUri
    string public contractUri;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    /// @dev Private counter to make internal security checks
    uint256 private tokenIdGiftedIndex;

    event Initialized(
        uint256 cap,
        string name,
        string symbol,
        address defaultRoyaltyReceiver,
        uint96 defaultFeeNumerator,
        uint256 startGiftingIndex,
        uint256 endGiftingIndex,
        string contractUri
    );
    event DefaultRoyaltyUpdated(address indexed royaltyReceiver, uint96 feeNumerator);
    event TokenRoyaltyUpdated(uint256 indexed tokenId, address indexed receiver, uint96 feeNumerator);
    event TokenRoyaltyReseted(uint256 indexed tokenId);
    event GiftingIndexesUpdated(uint256 startGiftingIndex, uint256 endGiftingIndex);
    event Gifted(address indexed to, uint256 tokenId);
    event Claimed(address indexed to, uint256 tokenId);
    event ContractURIUpdated(string indexed contractUri);
    event MaxClaimUpdated(uint256 oldMax, uint256 newMax);

    /// @notice Init contract
    /// @param cap_ Max amount of NFTs to be minted. Cannot change
    /// @param name NFT name
    /// @param symbol NFT symbol
    /// @param defaultRoyaltyReceiver NFT Royalties receiver for all the collection
    /// @param defaultFeeNumerator Fees to be charged for royalties
    /// @param _startGiftingIndex Start index for gitftble NFTs
    /// @param _endGiftingIndex End index for giftable NFTs
    /// @param _contractUri Contract Uri
    constructor(
        uint256 cap_,
        string memory name,
        string memory symbol,
        address defaultRoyaltyReceiver,
        uint96 defaultFeeNumerator,
        uint256 _startGiftingIndex,
        uint256 _endGiftingIndex,
        string memory _contractUri
    ) ERC721(name, symbol) {
        require(cap_ > 0, "NFTCapped: cap is 0");
        CAP = cap_;
        startGiftingIndex = _startGiftingIndex;
        endGiftingIndex = _endGiftingIndex;
        tokenIdGiftedIndex = startGiftingIndex;
        contractUri = _contractUri;
        super._setDefaultRoyalty(defaultRoyaltyReceiver, defaultFeeNumerator);
        emit Initialized(
            CAP,
            name,
            symbol,
            defaultRoyaltyReceiver,
            defaultFeeNumerator,
            startGiftingIndex,
            endGiftingIndex,
            contractUri
        );
    }

    /********** GETTERS ***********/

    /// @inheritdoc	IERC2981
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        public
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(tokenId <= CAP, "CANISNFT: TOKEN ID DOES NOT EXIST");
        return super.royaltyInfo(tokenId, salePrice);
    }

    /********** SETTERS ***********/

    /// @notice Royalties config
    /// @dev Set royalty receiver and feenumerator to be charged
    /// @param receiver Royalty beneficiary
    /// @param feeNumerator fees to be charged to users on sales
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        super._setDefaultRoyalty(receiver, feeNumerator);
        emit DefaultRoyaltyUpdated(receiver, feeNumerator);
    }

    /// @notice Set Gifting indexes
    /// @dev Canno set a gift index for already minted NFTs
    /// @param startIndex start index
    /// @param endIndex end index
    function setGiftingIndexes(uint256 startIndex, uint256 endIndex) external onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        require(
            startIndex >= tokenId && startGiftingIndex > endGiftingIndex && endGiftingIndex <= CAP,
            "CANISNFT: WRONG GRIFTING INDEXES"
        );
        startGiftingIndex = startIndex;
        endGiftingIndex = endIndex;
        tokenIdGiftedIndex = startGiftingIndex;
        emit GiftingIndexesUpdated(startIndex, endIndex);
    }

    /// @notice Modify a particular token royalty
    /// @param tokenId Id of the NFT to be modified
    /// @param receiver address of the royalty beneficiary
    /// @param feeNumerator fees to be charged
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external onlyOwner {
        require(tokenId <= CAP, "CANISNFT: TOKEN ID DOES NOT EXIST");
        super._setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit TokenRoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    /// @notice Reset token royalty to default one
    /// @param tokenId Id of the NFT to be modified
    function resetTokenRoyalty(uint256 tokenId) external onlyOwner {
        require(tokenId <= CAP, "CANISNFT: TOKEN ID DOES NOT EXIST");
        super._resetTokenRoyalty(tokenId);
        emit TokenRoyaltyReseted(tokenId);
    }

    /// @notice Modify a max claim by address
    /// @param max number of new max claim
    function setMaxClaim(uint256 max) external onlyOwner {
        require(max != 0, "CANISNFT: MAX MUST BE GREATER THAN ZERO");
        uint256 oldMax = maxClaim;
        maxClaim = max;
        emit MaxClaimUpdated(oldMax, maxClaim);
    }

    /********** INTERFACE ***********/

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Mint NFT
    /// @return id of the new minted NFT
    function safeMint() public onlyOwner returns (uint256) {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        require(newTokenId <= CAP, "NFTCAPPED: cap exceeded");
        _safeMint(this.owner(), newTokenId);
        return newTokenId;
    }

    /// @notice Gift an NFT
    /// @param to address to send gifted NFT
    /// @return id of the gifted NFT
    function _gift(address to) internal returns (uint256) {
        require(tokenIdGiftedIndex <= CAP, "NFTCAPPED: cap exceeded");
        require(
            tokenIdGiftedIndex >= startGiftingIndex && tokenIdGiftedIndex <= endGiftingIndex,
            "CANISNFT: CANNOT MINT NON GIFTABLE NFT"
        );
        super._approve(to, tokenIdGiftedIndex);
        super.safeTransferFrom(this.owner(), to, tokenIdGiftedIndex);
        uint256 tokenId = tokenIdGiftedIndex;
        tokenIdGiftedIndex += 1;
        return tokenId;
    }

    /// @notice Gift an NFT
    /// @param to address to send gifted NFT
    function gift(address to) external onlyOwner {
        uint256 tokenId = _gift(to);
        emit Gifted(to, tokenId);
    }

    /// @notice Claim an NFT
    /// @dev Function that users has to call to get an NFT
    function claim() external {
        require(
            balanceOf(msg.sender) == 0 || balanceOf(msg.sender) < maxClaim,
            "CANISNFT: OWNER CANNOT HAVE MORE THAN ONE NFT"
        );
        uint256 tokenId = _gift(msg.sender);
        emit Claimed(msg.sender, tokenId);
    }

    /// @custom:notice The following function is override required by Solidity.
    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @custom:notice The following function is override required by Solidity.
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /// @notice openSea integration royalty. See https://docs.opensea.io/docs/contract-level-metadata
    function contractURI() public view returns (string memory) {
        return contractUri;
    }

    /// @notice Set URI for an NFT
    /// @param tokenId id of the NFT to change URI
    /// @param _tokenURI tokenURI
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        super._setTokenURI(tokenId, _tokenURI);
    }

    /// @notice Mint NFTs
    /// @param quantity amount of NFTs to be minted
    /// @return id of the next NFT to be minted
    function safeMintBatch(uint256 quantity) external onlyOwner returns (uint256) {
        for (uint256 i = 0; i < quantity; i++) {
            safeMint();
        }
        return _tokenIdCounter.current();
    }

    /// @notice Modify tokenURis for several NFTs
    /// @dev The NFTs to be modified has to be consecutives
    /// @param startTokenId index to start modifying NFTs
    /// @param tokenURIs array of modified uris
    function setTokenURIBatch(uint256 startTokenId, string[] memory tokenURIs) external onlyOwner {
        require(tokenURIs.length < 500, "CANISNFT: BATCH SIZE EXCEEDED");
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            super._setTokenURI(startTokenId + i, tokenURIs[i]);
        }
    }

    /// @notice Modify contractUri for NFT collection
    /// @param _contractUri contractUri
    function setContractURI(string memory _contractUri) external onlyOwner {
        contractUri = _contractUri;
        emit ContractURIUpdated(contractUri);
    }
}
