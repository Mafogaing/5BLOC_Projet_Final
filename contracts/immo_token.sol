// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ImmoToken is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant MAX_PROPERTIES_PER_USER = 4;
    mapping(address => uint256) public propertyCount;
    mapping(uint256 => uint256) public lockTime;

    uint256 public constant COOLDOWN_TIME = 5 minutes;
    uint256 public constant LOCK_DURATION = 10 minutes;

    struct Property {
        string name;
        string description;
        string location;
        uint256 area;
        uint256 price;
        string metadataCid; // Nouveau champ pour stocker l'IPFS CID des métadonnées
        address[] previousOwners;
        uint256 createdAt;
        uint256 lastTransferAt;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => address) public propertyToOwner; // Mapping du propriétaire initial

    event PropertyCreated(uint256 tokenId, string name, string location, uint256 price, string metadataCid);
    event PropertyTransferred(uint256 tokenId, address from, address to);
    event PropertyPriceUpdated(uint256 tokenId, uint256 newPrice);

    constructor() ERC721("ImmoToken", "RET") {}

    function createProperty(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _area,
        uint256 _price,
        string memory _metadataCid // Utilisation du CID des métadonnées
    ) public onlyOwner returns (uint256) {
        require(bytes(_metadataCid).length > 0, "Invalid metadata CID");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);

        // Initialisation du tableau previousOwners comme un tableau vide
        address[] memory previousOwnersEmpty;

        properties[newItemId] = Property({
            name: _name,
            description: _description,
            location: _location,
            area: _area,
            price: _price,
            metadataCid: _metadataCid,
            previousOwners: previousOwnersEmpty, // Tableau initialisé vide          
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp
        });

        propertyToOwner[newItemId] = msg.sender; // Enregistre le propriétaire initial

        emit PropertyCreated(newItemId, _name, _location, _price, _metadataCid);
        return newItemId;
    }

    function purchaseProperty(uint256 _tokenId) public payable {
        require(ownerOf(_tokenId) != msg.sender, "You already own this property");
        require(propertyCount[msg.sender] < MAX_PROPERTIES_PER_USER, "Maximum property limit reached");
        require(block.timestamp >= lockTime[_tokenId], "Property is locked");
        require(block.timestamp >= properties[_tokenId].lastTransferAt + COOLDOWN_TIME, "Cooldown time not reached");
        require(msg.value >= properties[_tokenId].price, "Insufficient funds to purchase this property");

        address seller = ownerOf(_tokenId);

        properties[_tokenId].previousOwners.push(seller);
        properties[_tokenId].lastTransferAt = block.timestamp;

        _transfer(seller, msg.sender, _tokenId);
        propertyToOwner[_tokenId] = msg.sender; // Met à jour le propriétaire initial

        propertyCount[msg.sender]++;
        if (propertyCount[seller] > 0) {
            propertyCount[seller]--;
        }

        lockTime[_tokenId] = block.timestamp + LOCK_DURATION;

        payable(seller).transfer(msg.value);

        emit PropertyTransferred(_tokenId, seller, msg.sender);
    }

    function setPropertyPrice(uint256 _tokenId, uint256 _newPrice) public {
        require(ownerOf(_tokenId) == msg.sender, "You are not the owner of this property");
        properties[_tokenId].price = _newPrice;
        emit PropertyPriceUpdated(_tokenId, _newPrice);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked("http://localhost:8080/ipfs/", properties[tokenId].metadataCid));
    }

    function getOwnedProperties(address _owner) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](propertyCount[_owner]);
        uint256 counter = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (ownerOf(i) == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function getTotalProperties() public view returns (uint256) {
    return _tokenIds.current();
    }
}
