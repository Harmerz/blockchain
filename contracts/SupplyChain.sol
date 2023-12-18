// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract SupplyChain {
    struct ProductRecord {
        uint256 shipmentID;
        uint256 weight;
        uint256 timestamp;
    }

    struct Inventory {
        uint256 productID;
        uint256 totalWeight;
        ProductRecord[] productRecords;
    }

    struct Person {
        address userAddress;
        string name;
        string occupation;
        string location;
        Inventory[] inventory;
        ProductRecord[] sendShipment;
    }

    struct Shipment {
        address fromAddress;
        address toAddress;
        uint8 shipmentID;
        uint256 weight;
        uint256 productID;
        ProductRecord[] productRecords;
    }

    struct Product {
        uint256 productID;
        uint256 idBefore;
        string name;
        uint8 changedPercent;
        string Type;
        string description;
    }


    mapping(uint256 => Product) public products;
    uint256 public nextProductId = 1;

    function createProduct(
        uint256 _idBefore,
        string memory _name,
        uint8 _changedPercent,
        string memory _type,
        string memory _description
    ) external {
        Product memory newProduct = Product({
            productID: nextProductId,
            idBefore: _idBefore,
            name: _name,
            changedPercent: _changedPercent,
            Type: _type,
            description: _description
        });

        products[nextProductId] = newProduct;

        nextProductId++;
    }

     function updateProduct(
        uint256 _productId,
        uint256 _idBefore,
        string memory _name,
        uint8 _changedPercent,
        string memory _type,
        string memory _description
    ) external {
        require(_productId > 0 && _productId < nextProductId, "Invalid product ID");

        Product storage productToUpdate = products[_productId];
        productToUpdate.idBefore = _idBefore;
        productToUpdate.name = _name;
        productToUpdate.changedPercent = _changedPercent;
        productToUpdate.Type = _type;
        productToUpdate.description = _description;
    }

    function getAllProducts() external view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](nextProductId - 1);

        for (uint256 i = 1; i < nextProductId; i++) {
            allProducts[i - 1] = products[i];
        }

        return allProducts;
    }

    function getProductById(uint256 _productId) external view returns (Product memory) {
        require(_productId > 0 && _productId < nextProductId, "Invalid product ID");
        return products[_productId];
    }

    // Person
    mapping(address => Person) public people;
    function createPerson(
        address _userAddress,
        string memory _name,
        string memory _occupation,
        string memory _location
    ) public {
        require(people[_userAddress].userAddress == address(0), "User already exists");
        Person storage newPerson = people[_userAddress];
        newPerson.userAddress = _userAddress;
        newPerson.name = _name;
        newPerson.occupation = _occupation;
        newPerson.location = _location;

    }

    function getPersonByAddress(address _userAddress) external view returns (Person memory) {
        return people[_userAddress];
    }
  

}