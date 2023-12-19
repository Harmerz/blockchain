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
        uint256 shipmentID;
        uint256 weight;
        uint256 productID;
        uint256 timestamp;
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
    mapping(uint256 => Shipment) public shipments;
    uint256 public nextProductId = 1;
    uint256 public nextShipmentId = 1;

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

    // Inventory
   function addInventory(address _userAddress, uint256 _productId, uint256 _weight, uint256 _shipmentId) external {
    bool find = false;
    Person storage inventoryPerson = people[_userAddress];

    for (uint i = 0; i < inventoryPerson.inventory.length; i++) {
        if (inventoryPerson.inventory[i].productID == _productId) {
            // Update the existing product's weight
            inventoryPerson.inventory[i].totalWeight += _weight;

            // Add a new product record
            ProductRecord memory newProductRecord = ProductRecord({
                shipmentID: _shipmentId,
                weight: _weight,
                timestamp: block.timestamp
            });
            find = true;

            inventoryPerson.inventory[i].productRecords.push(newProductRecord);
            break;
        }
    }
    if(!find){
       // Create a new ProductRecord
        ProductRecord memory newProductRecord = ProductRecord({
            shipmentID: _shipmentId,
            weight: _weight,
            timestamp: block.timestamp
        });

        // Create a new Inventory with the product record
        Inventory memory newInventory = Inventory({
            productID: _productId,
            totalWeight: _weight,
            productRecords: new ProductRecord[](1)  // Use a memory array with one element
        });

        // Add the new product record to the inventory
        newInventory.productRecords[0] = newProductRecord;

        // Push the newInventory to the person's inventory
        inventoryPerson.inventory.push(); // Push an empty Inventory struct to the storage array
        uint256 index = inventoryPerson.inventory.length - 1; // Get the index of the last element
        inventoryPerson.inventory[index].productID = newInventory.productID; // Copy the productID
        inventoryPerson.inventory[index].totalWeight = newInventory.totalWeight; // Copy the totalWeight
        for (uint256 i = 0; i < newInventory.productRecords.length; i++) {
            inventoryPerson.inventory[index].productRecords.push(newProductRecord); // Copy the productRecords one by one
        }

    }
   
}


    function getInventoryByAddress(address _userAddress) external view returns (Inventory[] memory) {
        return people[_userAddress].inventory;
    }
    function getInventoryByAddressAndProductID(address _userAddress, uint256 _productID) external view returns (Inventory memory) {
        Person storage inventoryPerson = people[_userAddress];
        bool find = false;
        for (uint i = 0; i < inventoryPerson.inventory.length; i++) {
            if (inventoryPerson.inventory[i].productID == _productID) {
                find = true;
                return (people[_userAddress].inventory[i]);
            }
        }
       require(find, "Not Found");
       return people[_userAddress].inventory[0];
    }

    function addSendShipment(address _userAddress, uint256 _weight, uint256 _shipmentId) external {
        Person storage sendShipmentPerson = people[_userAddress]; 
        ProductRecord memory newProductRecord = ProductRecord({
            shipmentID: _shipmentId,
            weight: _weight,
            timestamp: block.timestamp
        });
        sendShipmentPerson.sendShipment.push();
        uint256 index = sendShipmentPerson.sendShipment.length - 1; // Get the index of the last element
        sendShipmentPerson.sendShipment[index] = newProductRecord;
    }

    function getSendShipmentByAddress(address _userAddress) external view returns (ProductRecord[] memory)  {
        return people[_userAddress].sendShipment; 
    }
    function reductionInventory(address _userAddress, uint256 _productId, uint256 _weight, ProductRecord[] memory _productRecords) external {
        Person storage inventoryPerson = people[_userAddress];


        // Iterate through the inventory items
        for (uint i = 0; i < inventoryPerson.inventory.length; i++) {
            if (inventoryPerson.inventory[i].productID == _productId) {
                // Ensure there is enough totalWeight to reduce

                // Reduce the totalWeight
                inventoryPerson.inventory[i].totalWeight -= _weight;

                // Iterate through the productRecords
                for (uint j = 0; j < inventoryPerson.inventory[i].productRecords.length; j++) {
                    for (uint k = 0; k < _productRecords.length; k++) {
                        // Check if shipmentID matches
                        if (inventoryPerson.inventory[i].productRecords[j].shipmentID == _productRecords[k].shipmentID && 
                        inventoryPerson.inventory[i].productRecords[j].timestamp == _productRecords[k].timestamp) {
                            // Reduce the product weight
                            inventoryPerson.inventory[i].productRecords[j].weight -= _productRecords[k].weight;
                        }

                    }
                }
                // Exit the loop since the product is found
                break;
            }
        }
    }

    function sendShipment(address _from, address _to, uint256 _weight, uint256 _productId, ProductRecord[] memory _productRecords) external {
        Shipment storage newShipment = shipments[nextShipmentId];
        newShipment.fromAddress = _from;
        newShipment.toAddress = _to;
        newShipment.shipmentID = nextShipmentId;
        newShipment.weight = _weight;
        newShipment.productID = _productId;
        newShipment.timestamp = block.timestamp;
        for(uint256 i = 0; i < _productRecords.length; i++){
            newShipment.productRecords.push(_productRecords[i]);
        }
        this.addInventory(_to, _productId, _weight, nextShipmentId);
        this.addSendShipment(_from, _weight, nextShipmentId);
        this.reductionInventory(_from, _productId, _weight, _productRecords);
        nextShipmentId++;
    }

    function addLocalInventory(address _userAddress, uint256 _productId, uint256 _weight, ProductRecord[] memory _productRecords) external {
        bool find = false;
    Person storage inventoryPerson = people[_userAddress];

    for (uint i = 0; i < inventoryPerson.inventory.length; i++) {
        if (inventoryPerson.inventory[i].productID == _productId) {
            // Update the existing product's weight
            inventoryPerson.inventory[i].totalWeight += _weight;
            
            find = true;
            for(uint j = 0; j < _productRecords.length; j++){
                inventoryPerson.inventory[i].productRecords.push(_productRecords[j]);
            }

            break;
        }
    }
    if(!find){

        // Create a new Inventory with the product record
        Inventory memory newInventory = Inventory({
            productID: _productId,
            totalWeight: _weight,
            productRecords: _productRecords
        });

        // Add the new product record to the inventory

        // Push the newInventory to the person's inventory
        inventoryPerson.inventory.push(); // Push an empty Inventory struct to the storage array
        uint256 index = inventoryPerson.inventory.length - 1; // Get the index of the last element
        inventoryPerson.inventory[index].productID = newInventory.productID; // Copy the productID
        inventoryPerson.inventory[index].totalWeight = newInventory.totalWeight; // Copy the totalWeight
        for(uint j = 0; j < _productRecords.length; j++){
                inventoryPerson.inventory[index].productRecords.push(_productRecords[j]);
            }
    }
    }

    function processMyProduct(address _userAddress, uint256 _productIdFrom, uint256 _productIdTo, uint256 _productWeight, ProductRecord[] memory _productRecords) public {
        Product storage productStorage = products[_productIdTo];
        uint weight = _productWeight * productStorage.changedPercent/100;
        this.addLocalInventory(_userAddress, _productIdTo, weight, _productRecords);
        this.reductionInventory(_userAddress, _productIdFrom, _productWeight, _productRecords);

    }


  

}