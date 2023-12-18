const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("SupplyChain", function () {
  let SupplyChain;
  let supplyChain;
  const userAddress = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";

  beforeEach(async function () {
    SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
    const occupation = "Software Engineer";
    const name = "John Doe";
    const location = "Cityville";
    await supplyChain.createPerson(userAddress, name, occupation, location);
    const person = await supplyChain.getPersonByAddress(userAddress);
    console.log(person)
  });


it("should add inventory to an existing product", async () => {
 
    const productId = 1;
    const weight = 100;
    const shipmentId = 123;

    // Add inventory for the first time
    console.log(userAddress, productId, weight, shipmentId)
    await supplyChain.addInventory(userAddress, productId, weight, shipmentId);
    // Get the user's inventory after the first addition
    const inventoryBefore = await supplyChain.getInventoryByAddressAndProductID(userAddress, productId);
    console.log(inventoryBefore.productRecords.length)
    // Check if the inventory was created correctly
    expect(inventoryBefore.productID).to.equal(productId);
    expect(inventoryBefore.totalWeight).to.equal(weight);
    expect(inventoryBefore.productRecords.length).to.equal(1);

    // Add more inventory to the existing product
    const additionalWeight = 50;
    const additionalShipmentId = 456;

    await supplyChain.addInventory(userAddress, productId, additionalWeight, additionalShipmentId);

    // Get the user's inventory after the second addition
    const inventoryAfter = await supplyChain.getInventoryByAddressAndProductID(userAddress, productId);
    console.log(inventoryAfter)
    // Check if the inventory was updated correctly
    expect(inventoryAfter.productID).to.equal(productId);
    expect(inventoryAfter.totalWeight).to.equal(weight + additionalWeight);
    expect(inventoryAfter.productRecords.length).to.equal(2);
  });

  it("should create a new inventory for a new product", async () => {
    const productId = 1;
    const weight = 100;
    const shipmentId = 123;

    // Add inventory for the first time
    await supplyChain.addInventory(userAddress, productId, weight, shipmentId);

    // Get the user's inventory after the first addition
    const inventoryBefore = await supplyChain.getInventoryByAddress(userAddress);

    // Check if the inventory was created correctly
    expect(inventoryBefore.length).to.equal(1);

    // Add inventory for a new product
    const newProductId = 2;
    const newWeight = 200;
    const newShipmentId = 789;

    await supplyChain.addInventory(userAddress, newProductId, newWeight, newShipmentId);

    // Get the user's inventory after adding inventory for a new product
    const newInventory = await supplyChain.getInventoryByAddress(userAddress);
    expect(newInventory.length).to.equal(2);
  });
});
