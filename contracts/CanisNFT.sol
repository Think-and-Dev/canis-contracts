// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./interfaces/ISignatureMintERC721.sol";

/// @title Canis NFT contract
/// @author Think and Dev
contract CanisNFT is ERC721URIStorage, ERC2981, EIP712, AccessControl {
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

    //use it to transfer the nft
    address public guardianDelivery;
    /**
     * @dev Minter rol
     */
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    using ECDSA for bytes32;

    bytes32 private constant TYPEHASH = keccak256("MintRequest(address to,string uri,uint256 tokenId)");

    /// @dev Mapping from mint request tokenId => whether the mint request is processed.
    mapping(uint256 => bool) private minted;

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
    ) ERC721(name, symbol) EIP712(name, "1") {
        require(cap_ > 0, "NFTCapped: cap is 0");
        CAP = cap_;
        startGiftingIndex = _startGiftingIndex;
        endGiftingIndex = _endGiftingIndex;
        tokenIdGiftedIndex = startGiftingIndex;
        contractUri = _contractUri;
        super._setDefaultRoyalty(defaultRoyaltyReceiver, defaultFeeNumerator);
        super._setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        super._setupRole(MINTER_ROLE, _msgSender());
        guardianDelivery = _msgSender();
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
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        super._setDefaultRoyalty(receiver, feeNumerator);
        emit DefaultRoyaltyUpdated(receiver, feeNumerator);
    }

    /// @notice Set Gifting indexes
    /// @dev Canno set a gift index for already minted NFTs
    /// @param startIndex start index
    /// @param endIndex end index
    function setGiftingIndexes(uint256 startIndex, uint256 endIndex) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(tokenId <= CAP, "CANISNFT: TOKEN ID DOES NOT EXIST");
        super._setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit TokenRoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    /// @notice Reset token royalty to default one
    /// @param tokenId Id of the NFT to be modified
    function resetTokenRoyalty(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(tokenId <= CAP, "CANISNFT: TOKEN ID DOES NOT EXIST");
        super._resetTokenRoyalty(tokenId);
        emit TokenRoyaltyReseted(tokenId);
    }

    /// @notice Modify a max claim by address
    /// @param max number of new max claim
    function setMaxClaim(uint256 max) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(max != 0, "CANISNFT: MAX MUST BE GREATER THAN ZERO");
        uint256 oldMax = maxClaim;
        maxClaim = max;
        emit MaxClaimUpdated(oldMax, maxClaim);
    }

    /********** INTERFACE ***********/

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Mint NFT
    /// @return id of the new minted NFT
    function safeMint() public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        require(newTokenId <= CAP, "NFTCAPPED: cap exceeded");
        _safeMint(_msgSender(), newTokenId);
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
        super.safeTransferFrom(guardianDelivery, to, tokenIdGiftedIndex);
        uint256 tokenId = tokenIdGiftedIndex;
        tokenIdGiftedIndex += 1;
        return tokenId;
    }

    /// @notice Gift an NFT
    /// @param to address to send gifted NFT
    function gift(address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        super._setTokenURI(tokenId, _tokenURI);
    }

    /// @notice Mint NFTs
    /// @param quantity amount of NFTs to be minted
    /// @return id of the next NFT to be minted
    function safeMintBatch(uint256 quantity) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        for (uint256 i = 0; i < quantity; i++) {
            safeMint();
        }
        return _tokenIdCounter.current();
    }

    /// @notice Modify tokenURis for several NFTs
    /// @dev The NFTs to be modified has to be consecutives
    /// @param startTokenId index to start modifying NFTs
    /// @param tokenURIs array of modified uris
    function setTokenURIBatch(uint256 startTokenId, string[] memory tokenURIs) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(tokenURIs.length < 500, "CANISNFT: BATCH SIZE EXCEEDED");
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            super._setTokenURI(startTokenId + i, tokenURIs[i]);
        }
    }

    /// @notice Modify contractUri for NFT collection
    /// @param _contractUri contractUri
    function setContractURI(string memory _contractUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contractUri = _contractUri;
        emit ContractURIUpdated(contractUri);
    }

    /// @dev Verifies that a mint request is signed by an authorized account.
    function verify(ISignatureMintERC721.MintRequest calldata _req, bytes calldata _signature)
        public
        view
        returns (bool success, address signer)
    {
        signer = _recoverAddress(_req, _signature);
        success = !minted[_req.tokenId] && _canSignMintRequest(signer);
    }

    /// @dev Returns whether a given address is authorized to sign mint requests.
    function _canSignMintRequest(address _signer) internal view returns (bool) {
        require(hasRole(MINTER_ROLE, _signer), "CANISNFT: must have minter role to mint");
        return true;
    }

    /// @dev Verifies a mint request and marks the request as minted.
    function _processRequest(ISignatureMintERC721.MintRequest calldata _req, bytes calldata _signature)
        internal
        returns (address signer)
    {
        bool success;
        (success, signer) = verify(_req, _signature);

        if (!success) {
            revert("CANISNFT: Invalid request");
        }

        require(_req.to != address(0), "CANISNFT: recipient undefined");
        require(_req.tokenId <= CAP, "CANISNFT: cap exceeded");
        require(_req.tokenId <= _tokenIdCounter.current(), "CANISNFT: Invalid token ID");

        minted[_req.tokenId] = true;
    }

    /// @dev Returns the address of the signer of the mint request.
    function _recoverAddress(ISignatureMintERC721.MintRequest calldata _req, bytes calldata _signature)
        internal
        view
        returns (address)
    {
        return _hashTypedDataV4(keccak256(_encodeRequest(_req))).recover(_signature);
    }

    /// @dev Resolves 'stack too deep' error in `recoverAddress`.
    function _encodeRequest(ISignatureMintERC721.MintRequest calldata _req) internal pure returns (bytes memory) {
        return abi.encode(TYPEHASH, _req.to, keccak256(bytes(_req.uri)), _req.tokenId);
    }

    /// @dev set new guardiar
    function setGuardian(address newGuardian) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newGuardian != address(0), "CANISNFT: address new guardian delivery can not be 0");
        require(hasRole(DEFAULT_ADMIN_ROLE, newGuardian), "CANISNFT: new guardian delivery must have admin role");
        guardianDelivery = newGuardian;
    }
}
