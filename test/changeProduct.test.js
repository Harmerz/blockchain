const { expect } = require("chai");
const { ethers } = require("hardhat");
const {utils} = require("ethers")
const { BigNumber } = require('ethers');

describe("SupplyChain", function () {
  let SupplyChain;
  let supplyChain;
  const userAddress1 = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
    const hexToDecimal = hex => BigNumber.from(hex).toNumber();


  beforeEach(async function () {
    SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
    const occupation = "Software Engineer";
    const name = "John Doe";
    const location = "Cityville";
    await supplyChain.createPerson(userAddress1, name, occupation, location);
    await supplyChain.createProduct(0, "Product 1", 80, "Type A", "Description A");
    await supplyChain.createProduct(1, "Product 2", 90, "Type B", "Description B");
  });
  
it("should Send Shipment with same product from user", async () => {
 
    const productId = 1;
    const weight = 100;
    const shipmentId = 0;

    await supplyChain.addInventory(userAddress1, productId, weight, shipmentId);
    const inventoryBefore = await supplyChain.getInventoryByAddressAndProductID(userAddress1, productId);
    // Check if the inventory was created correctly
    expect(inventoryBefore.productID).to.equal(productId);
    expect(inventoryBefore.totalWeight).to.equal(weight);
    expect(inventoryBefore.productRecords.length).to.equal(1);

    // Add more inventory to the existing product
    const additionalWeight = 50;
    const additionalShipmentId = 0;
    const newProductId = 2;

    await supplyChain.addInventory(userAddress1, newProductId, additionalWeight, additionalShipmentId);

    // Get the user's inventory after the second addition
    const inventoryAfter = await supplyChain.getInventoryByAddressAndProductID(userAddress1, productId);
    // Check if the inventory was updated correctly
    expect(inventoryAfter.productID).to.equal(productId);
    expect(inventoryAfter.totalWeight).to.equal(weight);
    expect(inventoryAfter.productRecords.length).to.equal(1);
    const productRecords = [
      { shipmentID: 0, weight: 60, timestamp: inventoryAfter.productRecords.filter(e => hexToDecimal(e.weight) === 100)[0].timestamp },
    ];

    await supplyChain.processMyProduct(userAddress1, productId, newProductId, 60, productRecords);
    const product1 = await supplyChain.getInventoryByAddressAndProductID(userAddress1, productId);
    const product2 = await supplyChain.getInventoryByAddressAndProductID(userAddress1, newProductId);
    
    expect(product1.totalWeight).to.equal(weight - 60);
    expect(product1.productID).to.equal(productId);
    expect(product1.productRecords.length).to.equal(1);
    console.log(product2.productRecords[0].timestamp)
    console.log(product2)

    expect(product2.totalWeight).to.equal(additionalWeight + 60*0.9);
    expect(product2.productID).to.equal(newProductId);
    expect(product2.productRecords.length).to.equal(2);




  });
});
